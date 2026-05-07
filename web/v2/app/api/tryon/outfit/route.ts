import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.0-flash-exp";

interface GarmentInput {
  name: string;
  imageUrl: string;
}

function stripDataPrefix(dataUrl: string): { mimeType: string; data: string } {
  const idx = dataUrl.indexOf(";base64,");
  if (dataUrl.startsWith("data:") && idx !== -1) {
    const mimeType = dataUrl.slice(5, idx);
    const data = dataUrl.slice(idx + 8);
    return { mimeType, data };
  }
  return { mimeType: "image/jpeg", data: dataUrl };
}

async function fetchAsBase64(url: string): Promise<{ mimeType: string; data: string }> {
  if (url.startsWith("data:")) return stripDataPrefix(url);
  const res = await fetch(url, {
    headers: { "User-Agent": "SPARKS/1.0" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Image fetch failed (${res.status})`);
  const mimeType = res.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
  const data = Buffer.from(await res.arrayBuffer()).toString("base64");
  return { mimeType, data };
}

async function uploadToFalStorage(dataUrl: string): Promise<string> {
  const FAL_KEY = process.env.FAL_API_KEY;
  if (!FAL_KEY) return dataUrl;

  const { mimeType, data } = stripDataPrefix(dataUrl);
  const binary = Buffer.from(data, "base64");

  const initRes = await fetch("https://rest.alpha.fal.ai/storage/upload/initiate", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ file_name: `outfit-${Date.now()}.jpg`, content_type: mimeType }),
  });
  if (!initRes.ok) return dataUrl;

  const { upload_url, file_url } = await initRes.json() as { upload_url: string; file_url: string };
  const putRes = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": mimeType }, body: binary });
  return putRes.ok ? file_url : dataUrl;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Try-on service not configured — add GOOGLE_GEMINI_API_KEY" }, { status: 503 });
  }

  let body: { avatarUrl?: unknown; garments?: unknown; viewLabel?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl : "";
  const viewLabel = typeof body.viewLabel === "string" ? body.viewLabel : "Front";
  const garments = Array.isArray(body.garments)
    ? (body.garments as GarmentInput[]).slice(0, 8).filter(
        (g) => typeof g?.name === "string" && typeof g?.imageUrl === "string"
      )
    : [];

  if (!avatarUrl) return NextResponse.json({ error: "avatarUrl is required" }, { status: 400 });
  if (!garments.length) return NextResponse.json({ error: "At least one garment is required" }, { status: 400 });

  // Fetch avatar + garment images in parallel; skip garments whose image fails
  const [avatarResult, ...garmentResults] = await Promise.allSettled([
    fetchAsBase64(avatarUrl),
    ...garments.map((g) => fetchAsBase64(g.imageUrl)),
  ]);

  if (avatarResult.status === "rejected") {
    console.error("[outfit-tryon] avatar fetch failed:", avatarResult.reason);
    return NextResponse.json({ error: "Could not load avatar image" }, { status: 502 });
  }

  const loadedGarments = garments
    .map((g, i) => ({ g, result: garmentResults[i] }))
    .filter((x) => x.result.status === "fulfilled")
    .map((x) => ({
      name: x.g.name,
      img: (x.result as PromiseFulfilledResult<{ mimeType: string; data: string }>).value,
    }));

  if (!loadedGarments.length) {
    return NextResponse.json({ error: "Could not load any garment images" }, { status: 502 });
  }

  const garmentList = loadedGarments.map((g, i) => `${i + 1}. ${g.name}`).join("\n");

  const prompt = `You are a virtual try-on system for a modest fashion app.

The first image is a full-body studio avatar photo. The next ${loadedGarments.length} image(s) are individual garment products on plain white backgrounds.

Garments to layer (apply in order, bottom layers first):
${garmentList}

Task: Render a photorealistic image of this avatar wearing ALL listed garments simultaneously as a complete layered outfit — exactly like dressing a real person (e.g. trousers underneath, tee over base, jacket over tee).

Requirements:
- Preserve the avatar's exact face, hijab, body proportions, and skin tone
- Maintain the same studio white background and professional lighting
- Show the ${viewLabel.toLowerCase()} view perspective
- Full modest coverage must be maintained (wrists, ankles, neckline covered)
- Complete head-to-toe figure visible
- Photorealistic studio quality
- Output the image only`;

  const geminiParts = [
    { text: prompt },
    { inline_data: { mime_type: avatarResult.value.mimeType, data: avatarResult.value.data } },
    ...loadedGarments.map((g) => ({ inline_data: { mime_type: g.img.mimeType, data: g.img.data } })),
  ];

  let geminiData: Record<string, unknown>;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: geminiParts }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[outfit-tryon] Gemini error:", res.status, errText.slice(0, 300));
      return NextResponse.json({ error: "Try-on generation failed — please try again" }, { status: 502 });
    }

    geminiData = await res.json() as Record<string, unknown>;
  } catch (err) {
    console.error("[outfit-tryon] network error:", err);
    return NextResponse.json({ error: "Could not reach generation service" }, { status: 502 });
  }

  type GPart = { inlineData?: { mimeType?: string; data?: string } };
  type GContent = { parts?: GPart[] };
  type GCandidate = { content?: GContent; finishReason?: string };
  const candidates = geminiData?.candidates as GCandidate[] | undefined;
  const imgPart = (candidates?.[0]?.content?.parts ?? []).find((p) => p.inlineData?.data);

  if (!imgPart?.inlineData?.data) {
    const reason = candidates?.[0]?.finishReason;
    console.error("[outfit-tryon] no image returned. finishReason:", reason);
    const msg = reason === "SAFETY"
      ? "Outfit blocked by safety filter — try different items"
      : "Generation failed — please try again";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const dataUrl = `data:${imgPart.inlineData.mimeType ?? "image/jpeg"};base64,${imgPart.inlineData.data}`;
  const resultUrl = await uploadToFalStorage(dataUrl).catch(() => dataUrl);

  return NextResponse.json({ resultUrl });
}
