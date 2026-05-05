import { NextRequest, NextResponse } from "next/server";
import { generateEmbeddings } from "@/lib/embeddings";
import { getCosineSimilarity, getMeanVector } from "@/lib/similarity";
import { createClient } from "@/lib/supabase/server";
import {
  NormalizedPin,
  extractBoardKeywords,
  buildReasonChips,
  confidenceFromScore,
} from "@/lib/pinterest";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  category?: string;
  tags?: string[];
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured", code: "OPENAI_CONFIG_MISSING" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", code: "BAD_REQUEST" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const rawPins: NormalizedPin[] = Array.isArray(b?.pins) ? (b.pins as NormalizedPin[]) : [];
  const pins = rawPins.slice(0, 300);
  const topK = Number.isFinite(Number(b?.topK)) ? Math.max(1, Math.min(100, Number(b.topK))) : 30;

  const usablePins = pins.filter((p) => p.usableForEmbedding && p.embeddingText);
  if (!usablePins.length) {
    return NextResponse.json(
      { error: "No usable pins found for embedding. Try a different board.", code: "NO_USABLE_PINS" },
      { status: 400 }
    );
  }

  // Fetch products from Supabase
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: dbProducts } = await supabase
    .from("products")
    .select("id, title, brand, price, image_url, product_url, category, tags, embedding")
    .eq("modesty_verified", true)
    .eq("in_stock", true)
    .gte("last_verified_at", thirtyDaysAgo)
    .limit(1000);

  const products: Product[] = [];
  const embeddingMap = new Map<string, number[]>();

  for (const p of dbProducts ?? []) {
    try {
      const embedding: number[] = typeof p.embedding === "string"
        ? JSON.parse(p.embedding)
        : p.embedding;
      if (!Array.isArray(embedding) || !embedding.length) continue;
      embeddingMap.set(p.id, embedding);
      products.push({
        id: p.id,
        name: p.title ?? "",
        brand: p.brand ?? "",
        price: Number(p.price ?? 0),
        imageUrl: p.image_url ?? "",
        productUrl: p.product_url ?? "",
        category: p.category ?? undefined,
        tags: Array.isArray(p.tags) ? (p.tags as string[]) : undefined,
      });
    } catch {
      // skip malformed products
    }
  }

  if (!products.length) {
    return NextResponse.json(
      { error: "No products available yet. Products are still being discovered.", code: "NO_PRODUCTS" },
      { status: 500 }
    );
  }

  try {
    // Generate pin embeddings in batches of 50
    const pinTexts = usablePins.map((p) => p.embeddingText);
    const pinVectors: number[][] = [];
    for (let i = 0; i < pinTexts.length; i += 50) {
      const batch = await generateEmbeddings(pinTexts.slice(i, i + 50));
      pinVectors.push(...batch);
    }

    if (!pinVectors.length) {
      return NextResponse.json({ error: "Failed to generate pin embeddings", code: "EMBEDDING_FAILED" }, { status: 500 });
    }

    const boardVector = getMeanVector(pinVectors);
    const boardKeywords = extractBoardKeywords(usablePins);

    const rawRanked = products
      .map((product) => {
        const embedding = embeddingMap.get(product.id);
        if (!embedding) return null;
        const score = getCosineSimilarity(boardVector, embedding);
        return { ...product, rawScore: score };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.rawScore - a.rawScore);

    const maxScore = rawRanked[0]?.rawScore ?? 0;
    const minScore = rawRanked[rawRanked.length - 1]?.rawScore ?? 0;
    const range = maxScore - minScore || 1;

    const ranked = rawRanked.slice(0, topK).map((product) => ({
      ...product,
      score: product.rawScore,
      matchPercent: Math.max(1, Math.min(99, Math.round(((product.rawScore - minScore) / range) * 100))),
      confidence: confidenceFromScore(product.rawScore),
      reasonChips: buildReasonChips(product, boardKeywords),
    }));

    return NextResponse.json({
      pinsUsed: pinVectors.length,
      productsRanked: ranked.length,
      boardKeywords: boardKeywords.slice(0, 12),
      boardVector,
      rankedProducts: ranked,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to rank products", code: "RANK_EXCEPTION", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
