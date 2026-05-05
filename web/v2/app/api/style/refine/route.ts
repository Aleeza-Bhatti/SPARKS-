import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { jsonCompletion } from "@/lib/openai";
import type { StyleProfile } from "@/lib/types";

const SYSTEM_PROMPT = `You are refining a user's style profile summary based on their feedback.
Given the original summary and the user's correction note, return a revised JSON object with:
- summary: A revised warm, observational one-sentence style description. 18-25 words.
- tags: Revised array of 5-8 {label, confidence} objects.
- colors: Keep the same 6 hex codes unless the correction explicitly changes them.
- style_tag: Either "chic" or "gothic".

Return only valid JSON.`;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as {
    original_summary?: string;
    correction_text?: string;
    selected_chips?: string[];
  };

  const { original_summary, correction_text, selected_chips } = body;

  if (!original_summary || (!correction_text && !selected_chips?.length)) {
    return NextResponse.json({ error: "Correction input required" }, { status: 400 });
  }

  const corrections = [correction_text, ...(selected_chips ?? [])].filter(Boolean).join("; ");
  const userPrompt = `Original summary: "${original_summary}"\nUser correction: "${corrections}"\nPlease revise the style profile accordingly.`;

  try {
    const result = await jsonCompletion<StyleProfile>(SYSTEM_PROMPT, userPrompt, "gpt-4o");

    const db = createAdminClient();
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

    return NextResponse.json(result);
  } catch (err) {
    console.error("[style/refine]", err);
    return NextResponse.json({ error: "Refinement failed", code: "REFINE_FAILED" }, { status: 500 });
  }
}
