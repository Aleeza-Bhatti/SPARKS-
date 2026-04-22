import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { existsSync, readFileSync } from "fs";
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

function loadProducts(): Product[] {
  const filePath = path.join(process.cwd(), "data", "products.json");
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as Product[];
  } catch {
    return [];
  }
}

function loadProductEmbeddings(): Map<string, number[]> {
  const filePath = path.join(process.cwd(), "data", "product_embeddings.json");
  if (!existsSync(filePath)) return new Map();
  try {
    const cache = JSON.parse(readFileSync(filePath, "utf8"));
    const items: { id: string; embedding: number[] }[] = Array.isArray(cache?.items) ? cache.items : [];
    return new Map(items.map((item) => [item.id, item.embedding]));
  } catch {
    return new Map();
  }
}

function buildProductEmbeddingText(product: Product): string {
  return [
    product.name ?? "",
    product.brand ?? "",
    product.category ?? "",
    Array.isArray(product.tags) ? product.tags.join(" ") : "",
  ]
    .filter(Boolean)
    .join(". ")
    .replace(/[#*_~`|<>[\]{}()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  // Cap pins to prevent runaway OpenAI costs
  const pins = rawPins.slice(0, 300);
  const topK = Number.isFinite(Number(b?.topK)) ? Math.max(1, Math.min(100, Number(b.topK))) : 30;

  const usablePins = pins.filter((p) => p.usableForEmbedding && p.embeddingText);
  if (!usablePins.length) {
    return NextResponse.json(
      { error: "No usable pins found for embedding. Try a different board.", code: "NO_USABLE_PINS" },
      { status: 400 }
    );
  }

  const products = loadProducts();
  if (!products.length) {
    return NextResponse.json(
      { error: "No product catalog found", code: "NO_PRODUCTS" },
      { status: 500 }
    );
  }

  const productEmbeddings = loadProductEmbeddings();

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

    // Score products — use pre-computed embeddings, skip products without one
    const productsWithEmbeddings = products.filter((p) => productEmbeddings.has(p.id));

    // If pre-computed embeddings are missing, generate on the fly (first run only)
    const productsToScore = productsWithEmbeddings.length ? productsWithEmbeddings : products;
    const embeddingMap = new Map(productEmbeddings);

    if (!productsWithEmbeddings.length) {
      const texts = products.map((p) => buildProductEmbeddingText(p));
      const vectors = await generateEmbeddings(texts);
      products.forEach((p, i) => embeddingMap.set(p.id, vectors[i]));
    }

    const rawRanked = productsToScore
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
