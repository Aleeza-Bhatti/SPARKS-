import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/openai";
import type { PinterestPin } from "@/lib/types";

const SYSTEM_PROMPT = `You are a personal style analyst helping users discover their aesthetic.
Analyse the provided Pinterest pin images and return a JSON object with:
- summary: A warm, observational one-sentence style description. Write like a friend who's known the user for years. Avoid clinical fashion jargon. Use unexpected adjective pairings ('softly structured', 'quietly bold') sparingly. 18-25 words.
- tags: Array of 5-8 objects {label, confidence} where confidence is 0-1. Labels should be specific aesthetic descriptors.
- colors: Array of 6 dominant hex color codes extracted from the pins.
- style_tag: Either "chic" (minimalist, structured, old-money, clean lines) or "gothic" (dark feminine, dramatic, romantic, editorial). Pick the closer match.

Return only valid JSON matching this shape exactly.`;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();

  const { data: profile } = await db
    .from("v2_style_profiles")
    .select("summary, tags, colors, style_tag, board_name, pins_analyzed, raw_pins")
    .eq("pinterest_user_id", session.userId)
    .single();

  if (!profile?.raw_pins) {
    return NextResponse.json({ error: "No board selected yet", code: "NO_PINS" }, { status: 404 });
  }

  if (profile.summary && profile.style_tag) {
    return NextResponse.json({
      summary: profile.summary,
      tags: profile.tags,
      colors: profile.colors,
      style_tag: profile.style_tag,
      board_name: profile.board_name,
      pins_analyzed: profile.pins_analyzed,
    });
  }

  const pins = profile.raw_pins as PinterestPin[];
  const imageUrls = pins.filter((p) => p.image_url).slice(0, 20).map((p) => p.image_url!);

  if (imageUrls.length === 0) {
    return NextResponse.json({ error: "No pin images available", code: "NO_IMAGES" }, { status: 400 });
  }

  const openai = getOpenAI();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyse these ${imageUrls.length} Pinterest pins and return the style profile JSON.` },
            ...imageUrls.map((url) => ({
              type: "image_url" as const,
              image_url: { url, detail: "low" as const },
            })),
          ],
        },
      ],
      max_tokens: 600,
    });

    const raw = response.choices[0].message.content ?? "{}";
    const result = JSON.parse(raw) as { summary: string; tags: unknown; colors: string[]; style_tag: string };

    await db.from("v2_style_profiles").upsert(
      {
        pinterest_user_id: session.userId,
        summary: result.summary,
        tags: result.tags,
        colors: result.colors,
        style_tag: result.style_tag,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "pinterest_user_id" }
    );

    return NextResponse.json({
      summary: result.summary,
      tags: result.tags,
      colors: result.colors,
      style_tag: result.style_tag,
      board_name: profile.board_name,
      pins_analyzed: imageUrls.length,
    });
  } catch (err) {
    console.error("[style/analyze]", err);
    return NextResponse.json({ error: "Analysis failed", code: "ANALYSIS_FAILED" }, { status: 500 });
  }
}
