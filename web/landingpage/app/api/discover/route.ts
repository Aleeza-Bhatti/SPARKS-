import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSearchQueries } from "@/lib/query-generation";
import { fetchProductsForQuery, RawProduct } from "@/lib/serpapi";
import { runModestyFilter } from "@/lib/modesty-filter";
import { generateEmbeddings, buildStyleProfileText } from "@/lib/embeddings";
import type { SupabaseClient } from "@supabase/supabase-js";

const CACHE_TTL_HOURS = 24;

async function fetchWithCache(query: string, supabase: SupabaseClient): Promise<RawProduct[]> {
  const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const { data: cached } = await supabase
    .from("search_cache")
    .select("results")
    .eq("query", query)
    .gte("cached_at", cutoff)
    .single();

  if (cached?.results) {
    return cached.results as RawProduct[];
  }

  const results = await fetchProductsForQuery(query);

  await supabase.from("search_cache").upsert(
    { query, results, cached_at: new Date().toISOString() },
    { onConflict: "query" }
  );

  return results;
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  // Load the user's style profile (including rate limit + status columns)
  const { data: profile } = await supabase
    .from("style_profiles")
    .select("aesthetics, raw_text_dump, discover_cooldown_until, discover_status")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "No style profile found", code: "NO_PROFILE" }, { status: 404 });
  }

  // Rate limit: one discover run per 24 hours per user
  if (profile.discover_cooldown_until && new Date(profile.discover_cooldown_until) > new Date()) {
    return NextResponse.json({ error: "Discovery already ran recently. Try again tomorrow.", code: "RATE_LIMITED" }, { status: 429 });
  }

  // Mark as running immediately so concurrent requests don't double-fire
  await supabase.from("style_profiles")
    .update({ discover_status: "running", discover_cooldown_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
    .eq("user_id", user.id);

  const aesthetics: string[] = Array.isArray(profile.aesthetics) ? profile.aesthetics : [];
  const freeText: string = profile.raw_text_dump ?? "";

  // Step 1 — Generate search queries from style profile
  let queries: string[];
  try {
    queries = await generateSearchQueries(aesthetics, freeText);
  } catch (err) {
    console.error("[discover] Query generation failed:", err);
    return NextResponse.json({ error: "Something went wrong", code: "QUERY_GEN_FAILED" }, { status: 500 });
  }

  // Step 2 — Fetch products per query, using search_cache (24hr TTL) to avoid repeat SerpApi calls
  let rawProducts: RawProduct[];
  try {
    const perQuery = await Promise.allSettled(
      queries.map((q) => fetchWithCache(q, supabase))
    );
    const all: RawProduct[] = [];
    perQuery.forEach((r) => { if (r.status === "fulfilled") all.push(...r.value); });
    // Deduplicate by productUrl
    const seen = new Set<string>();
    rawProducts = all.filter((p) => {
      if (seen.has(p.productUrl)) return false;
      seen.add(p.productUrl);
      return true;
    });
  } catch (err) {
    console.error("[discover] SerpApi fetch failed:", err);
    return NextResponse.json({ error: "Something went wrong", code: "SERPAPI_FAILED" }, { status: 500 });
  }

  if (!rawProducts.length) {
    return NextResponse.json({ error: "No products found", code: "NO_PRODUCTS" }, { status: 404 });
  }

  // Step 3 — Check which products are already in the DB (skip re-processing)
  const productUrls = rawProducts.map((p) => p.productUrl);
  const { data: existing } = await supabase
    .from("products")
    .select("product_url")
    .in("product_url", productUrls);

  const existingUrls = new Set((existing ?? []).map((p) => p.product_url));
  const newProducts = rawProducts.filter((p) => !existingUrls.has(p.productUrl));

  // Step 4 — Run modesty filter on new products only (title pre-filter runs inside)
  const modestyCandidates = newProducts.filter((p) => p.imageUrl);
  const modestyResults = await runModestyFilter(
    modestyCandidates.map((p) => ({ imageUrl: p.imageUrl, productUrl: p.productUrl, title: p.title }))
  );

  // Step 5 — Collect accepted products, then batch-embed them all at once
  const accepted = modestyCandidates.filter((product) => {
    const modesty = modestyResults.get(product.productUrl);
    if (!modesty) return false;
    return (
      modesty.verdict === "pass" ||
      (modesty.verdict === "uncertain" && modesty.score >= 0.45)
    );
  });

  const embeddingTexts = accepted.map((p) =>
    [p.title, p.brand, p.sourceQuery].filter(Boolean).join(". ")
  );

  let embeddings: number[][] = [];
  try {
    // Batch in groups of 50 — single API call per batch instead of one call per product
    for (let i = 0; i < embeddingTexts.length; i += 50) {
      const batch = await generateEmbeddings(embeddingTexts.slice(i, i + 50));
      embeddings.push(...batch);
    }
  } catch (err) {
    console.error("[discover] Batch embedding failed:", err);
    return NextResponse.json({ error: "Something went wrong", code: "EMBEDDING_FAILED" }, { status: 500 });
  }

  const toInsert = accepted.map((product, i) => {
    const modesty = modestyResults.get(product.productUrl)!;
    return {
      title: product.title,
      brand: product.brand,
      price: product.price,
      image_url: product.imageUrl,
      product_url: product.productUrl,
      source: product.source,
      embedding: JSON.stringify(embeddings[i]),
      modesty_verified: true,
      modesty_score: modesty.score,
      in_stock: true,
      last_verified_at: new Date().toISOString(),
    };
  });

  // Insert in batches of 50
  let inserted = 0;
  const batchSize = 50;
  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);
    const { error } = await supabase
      .from("products")
      .upsert(batch, { onConflict: "product_url", ignoreDuplicates: true });

    if (!error) inserted += batch.length;
  }

  await supabase.from("style_profiles")
    .update({ discover_status: "complete" })
    .eq("user_id", user.id);

  return NextResponse.json({
    ok: true,
    queriesGenerated: queries.length,
    rawProductsFound: rawProducts.length,
    newProductsProcessed: modestyCandidates.length,
    passedModesty: toInsert.length,
    insertedToDb: inserted,
  });
}
