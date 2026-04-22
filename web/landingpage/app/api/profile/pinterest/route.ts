import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { boardKeywords?: unknown; boardVector?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body", code: "BAD_REQUEST" }, { status: 400 });
  }

  const boardKeywords = Array.isArray(body.boardKeywords)
    ? (body.boardKeywords as unknown[]).filter((k): k is string => typeof k === "string")
    : [];

  const boardVector = Array.isArray(body.boardVector) ? body.boardVector as number[] : null;

  if (!boardVector || boardVector.length === 0) {
    return NextResponse.json({ error: "Board vector is required", code: "NO_VECTOR" }, { status: 400 });
  }

  const { error: dbError } = await supabase.from("style_profiles").upsert(
    {
      user_id: user.id,
      aesthetics: boardKeywords,
      raw_text_dump: `Pinterest board keywords: ${boardKeywords.join(", ")}`,
      embedding: JSON.stringify(boardVector),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (dbError) {
    console.error("[profile/pinterest] DB upsert failed:", dbError.message);
    return NextResponse.json({ error: "Something went wrong", code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
