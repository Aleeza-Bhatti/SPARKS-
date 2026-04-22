import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding, buildStyleProfileText } from "@/lib/embeddings";

export async function POST(request: Request) {
  // Verify the user is signed in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  // Validate request body
  let body: { aesthetics?: unknown; freeText?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body", code: "BAD_REQUEST" }, { status: 400 });
  }

  const aesthetics = Array.isArray(body.aesthetics)
    ? (body.aesthetics as unknown[]).filter((a): a is string => typeof a === "string")
    : [];

  const freeText = typeof body.freeText === "string" ? body.freeText.trim().slice(0, 1000) : "";

  if (aesthetics.length === 0) {
    return NextResponse.json({ error: "Select at least one aesthetic", code: "NO_AESTHETICS" }, { status: 400 });
  }
  if (aesthetics.length > 20) {
    return NextResponse.json({ error: "Too many aesthetics selected", code: "BAD_REQUEST" }, { status: 400 });
  }

  // Build a single text description of their style and generate an embedding from it
  const profileText = buildStyleProfileText(aesthetics, freeText);

  let embedding: number[];
  try {
    embedding = await generateEmbedding(profileText);
  } catch (err) {
    console.error("[quiz] Embedding failed:", err);
    return NextResponse.json({ error: "Something went wrong", code: "EMBEDDING_FAILED" }, { status: 500 });
  }

  // Save style profile to Supabase
  // upsert so retaking the quiz overwrites the old profile
  const { error: dbError } = await supabase.from("style_profiles").upsert(
    {
      user_id: user.id,
      aesthetics,
      raw_text_dump: freeText,
      embedding: JSON.stringify(embedding),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (dbError) {
    console.error("[quiz] DB upsert failed:", dbError.message, dbError.code);
    return NextResponse.json({ error: "Something went wrong", code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
