import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { searchProducts } from "@/lib/products";
import { generateEmbedding } from "@/lib/embeddings";
import { jsonCompletion } from "@/lib/openai";

const SYSTEM_PROMPT = `You parse a natural language fashion search query into structured filters.
Return a JSON object with these exact fields:
- intent: string — a short phrase describing the user's core need (5 words or fewer)
- keywords: string[] — key style/clothing terms extracted from the query
Return only valid JSON with these exact keys.`;

type QueryParsed = {
  intent: string;
  keywords: string[];
};

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { query?: string };
  const query = body.query?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query required (min 2 chars)" }, { status: 400 });
  }
  if (query.length > 500) {
    return NextResponse.json({ error: "Query too long (max 500 chars)" }, { status: 400 });
  }

  try {
    const [parsed, queryEmbedding] = await Promise.all([
      jsonCompletion<QueryParsed>(SYSTEM_PROMPT, `Parse this fashion search: "${query}"`, "gpt-4o-mini"),
      generateEmbedding(query),
    ]);

    const results = searchProducts(parsed.keywords ?? [], queryEmbedding, 8);
    return NextResponse.json({ results, intent: parsed.intent });
  } catch {
    const results = searchProducts([], undefined, 8);
    return NextResponse.json({ results, intent: query });
  }
}
