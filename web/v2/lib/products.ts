import { readFileSync } from "fs";
import { join } from "path";
import type { Product } from "./types";
import { getCosineSimilarity } from "./similarity";

// V1 product catalog — 50 real modest fashion products
import rawProducts from "@/data/products.json";

export const ALL_PRODUCTS = rawProducts as Product[];

// Pre-computed product embeddings from v1 (text-embedding-3-small)
let _embeddings: { id: string; embedding: number[] }[] | null = null;

export function loadProductEmbeddings(): { id: string; embedding: number[] }[] {
  if (_embeddings) return _embeddings;
  try {
    // Try v1's pre-computed file first (same repo, one level up)
    const embPath = join(process.cwd(), "../landingpage/data/product_embeddings.json");
    const raw = JSON.parse(readFileSync(embPath, "utf-8")) as {
      items: { id: string; embedding: number[] }[];
    };
    _embeddings = raw.items;
  } catch {
    _embeddings = [];
  }
  return _embeddings;
}

// Rank products by cosine similarity to a query embedding, return top N
export function rankByEmbedding(queryEmbedding: number[], topN = 12): Product[] {
  const embeddings = loadProductEmbeddings();
  if (!embeddings.length) return ALL_PRODUCTS.slice(0, topN);

  const embMap = new Map(embeddings.map((e) => [e.id, e.embedding]));

  return ALL_PRODUCTS.map((p) => {
    const emb = embMap.get(p.id);
    const score = emb ? getCosineSimilarity(queryEmbedding, emb) : 0;
    return { ...p, matchScore: score };
  })
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
    .slice(0, topN);
}

// Keyword search + optional embedding re-rank
export function searchProducts(keywords: string[], queryEmbedding?: number[], topN = 8): Product[] {
  if (!keywords.length && !queryEmbedding) return ALL_PRODUCTS.slice(0, topN);

  let pool = ALL_PRODUCTS;

  if (keywords.length > 0) {
    const kw = keywords.map((k) => k.toLowerCase());
    const scored = pool.map((p) => {
      const text = `${p.name} ${p.brand} ${p.category} ${p.tags.join(" ")}`.toLowerCase();
      const score = kw.reduce((acc, k) => acc + (text.includes(k) ? 1 : 0), 0);
      return { p, score };
    });
    const matched = scored.filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
    if (matched.length > 0) pool = matched.map(({ p }) => p);
  }

  if (queryEmbedding) {
    const embeddings = loadProductEmbeddings();
    const embMap = new Map(embeddings.map((e) => [e.id, e.embedding]));
    pool = pool
      .map((p) => {
        const emb = embMap.get(p.id);
        return { ...p, matchScore: emb ? getCosineSimilarity(queryEmbedding, emb) : 0 };
      })
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }

  return pool.slice(0, topN);
}
