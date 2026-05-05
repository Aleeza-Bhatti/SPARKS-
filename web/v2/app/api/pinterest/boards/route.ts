import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBoards } from "@/lib/pinterest";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const boards = await getBoards(session.pinterestToken);
    return NextResponse.json({ boards });
  } catch (err) {
    console.error("[pinterest/boards]", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch boards";
    if (msg.includes("401")) {
      return NextResponse.json({ error: "Pinterest session expired. Please reconnect.", code: "TOKEN_EXPIRED" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not fetch boards", code: "BOARDS_FAILED" }, { status: 500 });
  }
}
