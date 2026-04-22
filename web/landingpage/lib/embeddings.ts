const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small";

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
  if (!texts.length) return [];

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json?.error?.message || "Batch embedding request failed");

  return (json.data as { embedding: number[] }[]).map((d) => d.embedding);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json?.error?.message || "Embedding request failed");

  return json.data[0].embedding as number[];
}

// Ported from pinterest-oauth-server.js — cleans and normalizes text before embedding
export function buildStyleProfileText(
  aesthetics: string[],
  freeText: string
): string {
  const aestheticLine = aesthetics.length
    ? `Style aesthetics: ${aesthetics.join(", ")}.`
    : "";

  const cleaned = freeText
    .replace(/[#*_~`|<>[\]{}()]/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return [aestheticLine, cleaned].filter(Boolean).join(" ");
}
