import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { swipes?: unknown[] };
  if (!Array.isArray(body.swipes)) {
    return NextResponse.json({ error: "swipes array required" }, { status: 400 });
  }

  const db = createAdminClient();
  await db.from("v2_swipe_sessions").insert({
    pinterest_user_id: session.userId,
    swipes: body.swipes,
    completed_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
