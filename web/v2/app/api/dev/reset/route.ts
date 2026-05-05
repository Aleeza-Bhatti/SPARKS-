import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";

// Clears the current user's onboarding data so they can re-run the quiz.
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  await db.from("v2_style_profiles").delete().eq("pinterest_user_id", session.userId);
  await db.from("v2_user_standards").delete().eq("pinterest_user_id", session.userId);
  await db.from("v2_swipe_sessions").delete().eq("pinterest_user_id", session.userId);

  return NextResponse.json({ ok: true });
}
