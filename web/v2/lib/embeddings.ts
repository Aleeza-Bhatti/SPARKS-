export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });

  const json = await res.json() as { data?: { embedding: number[] }[]; error?: { message: string } };
  if (!res.ok) throw new Error(json.error?.message ?? "Embedding request failed");
  return json.data![0].embedding;
}
