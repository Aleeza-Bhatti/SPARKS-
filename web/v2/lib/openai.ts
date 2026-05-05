import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export async function jsonCompletion<T>(
  systemPrompt: string,
  userPrompt: string,
  model: "gpt-4o" | "gpt-4o-mini" = "gpt-4o"
): Promise<T> {
  const client = getOpenAI();
  const res = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
  });
  const raw = res.choices[0].message.content ?? "{}";
  return JSON.parse(raw) as T;
}
