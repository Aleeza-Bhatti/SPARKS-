const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export type ModestyResult = {
  verdict: "pass" | "fail" | "uncertain";
  score: number; // 0–1 confidence that the item is modest
  reason: string;
};

const MODESTY_PROMPT = `You are checking if a clothing item meets modest coverage requirements for hijabi women.

Criteria — ALL must pass:
1. Sleeves past the elbow (or clearly long-sleeved)
2. Neckline not low-cut or revealing
3. Not sheer or see-through
4. Not form-fitting or body-con

Look at the clothing item in the image. Ignore models, focus on the garment.

Respond with JSON only:
{
  "verdict": "pass" | "fail" | "uncertain",
  "score": 0.0–1.0,
  "reason": "one sentence explaining your decision"
}

- "pass" = clearly meets all criteria, score 0.7–1.0
- "fail" = clearly fails one or more criteria, score 0.0–0.3
- "uncertain" = cannot determine from image, score 0.4–0.6`;

export async function checkModesty(imageUrl: string): Promise<ModestyResult> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: MODESTY_PROMPT },
            { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
    }),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json?.error?.message || "Modesty check failed");

  const content = json.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);

  return {
    verdict: parsed.verdict ?? "uncertain",
    score: Number(parsed.score ?? 0.5),
    reason: String(parsed.reason ?? ""),
  };
}

export async function runModestyFilter(
  products: { imageUrl: string; productUrl: string }[]
): Promise<Map<string, ModestyResult>> {
  const results = new Map<string, ModestyResult>();

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map(async (product) => {
        const result = await checkModesty(product.imageUrl);
        return { productUrl: product.productUrl, result };
      })
    );

    settled.forEach((outcome) => {
      if (outcome.status === "fulfilled") {
        results.set(outcome.value.productUrl, outcome.value.result);
      }
    });
  }

  return results;
}
