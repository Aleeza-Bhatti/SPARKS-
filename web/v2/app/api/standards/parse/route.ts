import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { jsonCompletion } from "@/lib/openai";
import type { ParsedStandards } from "@/lib/types";

const SYSTEM_PROMPT = `You extract modesty standards from natural language text.
Return a JSON object with these exact fields:
- neckline_max_depth: string — one of "turtleneck", "crew", "collarbone", "modest-v", "standard-v"
- sleeve_min_length: string — one of "wrist", "three-quarter", "elbow", "short"
- hem_min_length: string — one of "ankle", "midi", "knee", "above-knee"
- requires_opaque: boolean — true if the user wants no see-through fabric
- no_form_fitting: boolean — true if the user wants loose/relaxed fit
- custom_notes: string or null — any other constraints that don't fit above

Be conservative: if unsure, use the more coverage-positive interpretation.
Return only valid JSON with these exact keys.`;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { text?: string };
  const { text } = body;

  if (!text || typeof text !== "string" || text.trim().length < 5) {
    return NextResponse.json({ error: "Standards text is required (min 5 chars)" }, { status: 400 });
  }
  if (text.length > 1000) {
    return NextResponse.json({ error: "Text too long (max 1000 chars)" }, { status: 400 });
  }

  try {
    const parsed = await jsonCompletion<ParsedStandards>(
      SYSTEM_PROMPT,
      `Parse these modesty standards: "${text.trim()}"`,
      "gpt-4o"
    );

    const db = createAdminClient();
    await db.from("v2_user_standards").upsert(
      {
        pinterest_user_id: session.userId,
        raw_text: text.trim(),
        parsed,
      },
      { onConflict: "pinterest_user_id" }
    );

    return NextResponse.json({ parsed });
  } catch (err) {
    console.error("[standards/parse]", err);
    return NextResponse.json({ error: "Parsing failed", code: "PARSE_FAILED" }, { status: 500 });
  }
}
