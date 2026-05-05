import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPins } from "@/lib/pinterest";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { boardId?: string; boardName?: string };
  const { boardId, boardName } = body;

  if (!boardId || typeof boardId !== "string") {
    return NextResponse.json({ error: "boardId is required" }, { status: 400 });
  }

  try {
    const pins = await getPins(session.pinterestToken, boardId, 25);

    if (pins.length === 0) {
      return NextResponse.json({ error: "No pins found in this board", code: "NO_PINS" }, { status: 404 });
    }

    const db = createAdminClient();
    const { error: upsertErr } = await db.from("v2_style_profiles").upsert(
      {
        pinterest_user_id: session.userId,
        board_id: boardId,
        board_name: boardName ?? boardId,
        pins_analyzed: pins.length,
        raw_pins: pins,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "pinterest_user_id" }
    );

    if (upsertErr) {
      console.error("[pinterest/pins] upsert error:", upsertErr.message);
      return NextResponse.json({ error: "Failed to save board data", code: "DB_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pinCount: pins.length });
  } catch (err) {
    console.error("[pinterest/pins]", err);
    return NextResponse.json({ error: "Failed to fetch pins", code: "PINS_FAILED" }, { status: 500 });
  }
}
