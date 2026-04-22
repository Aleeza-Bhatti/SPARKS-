const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function generateSearchQueries(
  aesthetics: string[],
  freeText: string
): Promise<string[]> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");

  const prompt = `You are a fashion search expert helping find modest clothing for hijabi women.

A user's style profile:
- Aesthetics: ${aesthetics.join(", ")}
- In their own words: "${freeText || "not provided"}"

Generate exactly 20 specific Google Shopping search queries to find real products that match this style.

Rules:
- Queries must be for modest clothing only (long sleeves, long skirts, maxi dresses, abayas, modest tops, wide leg pants etc)
- Style-first language — describe the aesthetic, silhouette, fabric, color
- Never include words like "modest", "hijab", "islamic" in the queries — let the style speak
- Each query should be 2-5 words, specific enough to return real products
- Vary across: dresses, tops, skirts, outerwear, trousers
- No duplicates, no accessories

Return a JSON array of strings only. No explanation. Example format:
["dark maxi skirt", "structured long sleeve top black", "minimalist oversized coat"]`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json?.error?.message || "Query generation failed");

  const content = json.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);

  // Handle both {"queries": [...]} and bare array responses
  const queries: unknown = Array.isArray(parsed) ? parsed : Object.values(parsed)[0];
  if (!Array.isArray(queries)) throw new Error("Unexpected response format from OpenAI");

  return (queries as unknown[])
    .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
    .slice(0, 20);
}
