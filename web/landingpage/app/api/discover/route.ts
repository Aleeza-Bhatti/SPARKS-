import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSearchQueries } from "@/lib/query-generation";
import { fetchProductsForQueries } from "@/lib/serpapi";
import { runModestyFilter } from "@/lib/modesty-filter";
import { generateEmbedding, buildStyleProfileText } from "@/lib/embeddings";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  // Load the user's style profile
  const { data: profile } = await supabase
    .from("style_profiles")
    .select("aesthetics, raw_text_dump")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "No style profile found", code: "NO_PROFILE" }, { status: 404 });
  }

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

  // Step 2 — Fetch raw products from SerpApi
  let rawProducts: Awaited<ReturnType<typeof fetchProductsForQueries>>;
  try {
    rawProducts = await fetchProductsForQueries(queries);
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

  // Step 4 — Run modesty filter on new products only
  const modestyCandidates = newProducts.filter((p) => p.imageUrl);
  const modestyResults = await runModestyFilter(modestyCandidates);

  // Step 5 — Generate embeddings and store verified products
  const toInsert = [];
  for (const product of modestyCandidates) {
    const modesty = modestyResults.get(product.productUrl);
    if (!modesty) continue;

    // Accept pass, or uncertain with reasonable confidence
    // Queries are already modest-focused so uncertain = benefit of the doubt
    const isAccepted =
      modesty.verdict === "pass" ||
      (modesty.verdict === "uncertain" && modesty.score >= 0.45);

    if (!isAccepted) continue;

    const embeddingText = [product.title, product.brand, product.sourceQuery]
      .filter(Boolean)
      .join(". ");

    let embedding: number[];
    try {
      embedding = await generateEmbedding(embeddingText);
    } catch {
      continue;
    }

    toInsert.push({
      title: product.title,
      brand: product.brand,
      price: product.price,
      image_url: product.imageUrl,
      product_url: product.productUrl,
      source: product.source,
      embedding: JSON.stringify(embedding),
      modesty_verified: true,
      modesty_score: modesty.score,
      in_stock: true,
      last_verified_at: new Date().toISOString(),
    });
  }

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

  return NextResponse.json({
    ok: true,
    queriesGenerated: queries.length,
    rawProductsFound: rawProducts.length,
    newProductsProcessed: modestyCandidates.length,
    passedModesty: toInsert.length,
    insertedToDb: inserted,
  });
}
