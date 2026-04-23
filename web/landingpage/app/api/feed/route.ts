import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";

type SupabaseProduct = {
  id: string;
  title: string;
  brand: string;
  price: number;
  image_url: string;
  product_url: string;
  embedding: string;
};

// --- Ported utilities from pinterest-oauth-server.js ---

function getCosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function confidenceFromScore(score: number): string {
  if (score >= 0.35) return "high";
  if (score >= 0.28) return "medium";
  if (score >= 0.22) return "low";
  return "very_low";
}

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
}

function buildProductEmbeddingText(product: Record<string, unknown>): string {
  const chunks = [
    cleanText(product.name),
    cleanText(product.brand),
    cleanText(product.category),
    Array.isArray(product.tags)
      ? product.tags.map((t) => cleanText(String(t))).filter(Boolean).join(" ")
      : "",
  ].filter(Boolean);
  return chunks.join(". ").replace(/[#*_~`|<>[\]{}()]/g, " ").replace(/\s+/g, " ").trim();
}

// --- Load product data from files (pre-computed, do not regenerate) ---

const dataDir = path.join(process.cwd(), "data");

function loadProducts(): Record<string, unknown>[] {
  const filePath = path.join(dataDir, "products.json");
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

function loadProductEmbeddings(): Map<string, number[]> {
  const filePath = path.join(dataDir, "product_embeddings.json");
  if (!existsSync(filePath)) return new Map();
  try {
    const cache = JSON.parse(readFileSync(filePath, "utf8"));
    const items: { id: string; embedding: number[] }[] = Array.isArray(cache?.items) ? cache.items : [];
    return new Map(items.map((item) => [item.id, item.embedding]));
  } catch {
    return new Map();
  }
}

// --- Feed endpoint ---

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  // Fetch the user's style embedding from Supabase
  const { data: profile, error: profileError } = await supabase
    .from("style_profiles")
    .select("embedding, aesthetics")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "No style profile found", code: "NO_PROFILE" }, { status: 404 });
  }

  // Embedding is stored as a JSON string — parse it back to a number array
  let styleVector: number[];
  try {
    styleVector = typeof profile.embedding === "string"
      ? JSON.parse(profile.embedding)
      : profile.embedding;
  } catch {
    return NextResponse.json({ error: "Something went wrong", code: "INVALID_EMBEDDING" }, { status: 500 });
  }

  // Try Supabase products first, fall back to static JSON if empty
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: dbProducts } = await supabase
    .from("products")
    .select("id, title, brand, price, image_url, product_url, embedding")
    .eq("modesty_verified", true)
    .eq("in_stock", true)
    .gte("last_verified_at", thirtyDaysAgo)
    .limit(500);

  let scored: { id: string; name: string; brand: string; price: number; imageUrl: string; productUrl: string; category?: string; rawScore: number; confidence: string }[] = [];

  if (dbProducts && dbProducts.length > 0) {
    // Score products from Supabase
    scored = (dbProducts as SupabaseProduct[])
      .map((product) => {
        let embedding: number[];
        try {
          embedding = typeof product.embedding === "string"
            ? JSON.parse(product.embedding)
            : product.embedding;
        } catch {
          return null;
        }
        const score = getCosineSimilarity(styleVector, embedding);
        return {
          id: product.id,
          name: product.title,
          brand: product.brand ?? "",
          price: product.price,
          imageUrl: product.image_url,
          productUrl: product.product_url,
          rawScore: score,
          confidence: confidenceFromScore(score),
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.rawScore - a.rawScore);
  } else {
    // Fall back to static JSON file
    const staticProducts = loadProducts();
    const embeddingMap = loadProductEmbeddings();

    scored = staticProducts
      .map((product) => {
        const id = String(product.id ?? "");
        const embedding = embeddingMap.get(id);
        if (!embedding) return null;
        const score = getCosineSimilarity(styleVector, embedding);
        return {
          id,
          name: String(product.name ?? ""),
          brand: String(product.brand ?? ""),
          price: Number(product.price ?? 0),
          imageUrl: String(product.imageUrl ?? ""),
          productUrl: String(product.productUrl ?? ""),
          category: String(product.category ?? ""),
          rawScore: score,
          confidence: confidenceFromScore(score),
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.rawScore - a.rawScore);
  }

  if (!scored.length) {
    return NextResponse.json({ error: "Something went wrong", code: "SCORING_FAILED" }, { status: 500 });
  }

  // Normalize scores to a 1–99% match percentage
  const maxScore = scored[0].rawScore;
  const minScore = scored[scored.length - 1].rawScore;
  const range = maxScore - minScore || 1;

  const ranked = scored
    .slice(0, 30)
    .map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      imageUrl: product.imageUrl,
      productUrl: product.productUrl,
      matchPercent: Math.max(1, Math.min(99, Math.round(((product.rawScore - minScore) / range) * 100))),
      confidence: product.confidence,
    }));

  return NextResponse.json({ products: ranked, aesthetics: profile.aesthetics });
}
