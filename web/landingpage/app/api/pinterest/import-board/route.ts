import { NextRequest, NextResponse } from "next/server";
import { normalizePin, NormalizedPin } from "@/lib/pinterest";
import { createClient } from "@/lib/supabase/server";

async function fetchBoardPins(
  boardId: string,
  limit: number,
  accessToken: string
): Promise<{ ok: true; pins: Record<string, unknown>[] } | { ok: false; status: number; details: unknown }> {
  const pins: Record<string, unknown>[] = [];
  let bookmark: string | null = null;

  while (pins.length < limit) {
    const url = new URL(`https://api.pinterest.com/v5/boards/${encodeURIComponent(boardId)}/pins`);
    url.searchParams.set("page_size", String(Math.min(100, limit - pins.length)));
    if (bookmark) url.searchParams.set("bookmark", bookmark);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok) return { ok: false, status: res.status, details: data };

    const items: Record<string, unknown>[] = Array.isArray(data.items) ? data.items : [];
    pins.push(...items);
    bookmark = data.bookmark || null;
    if (!bookmark || items.length === 0) break;
  }

  return { ok: true, pins: pins.slice(0, limit) };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

  const accessToken = req.cookies.get("pinterest_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { error: "Pinterest is not connected", code: "PINTEREST_NOT_CONNECTED" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", code: "BAD_REQUEST" }, { status: 400 });
  }

  const boardId = typeof (body as Record<string, unknown>)?.boardId === "string"
    ? ((body as Record<string, unknown>).boardId as string).trim()
    : "";
  const rawLimit = Number((body as Record<string, unknown>)?.limit ?? 120);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(200, rawLimit)) : 120;

  if (!boardId) {
    return NextResponse.json({ error: "boardId is required", code: "BAD_REQUEST" }, { status: 400 });
  }

  try {
    const result = await fetchBoardPins(boardId, limit, accessToken);
    if (!result.ok) {
      return NextResponse.json(
        { error: "Failed to fetch pins for this board", code: "PINTEREST_PINS_FAILED", details: result.details },
        { status: result.status }
      );
    }

    const pins: NormalizedPin[] = result.pins.map((pin) => normalizePin(pin, boardId));
    const usableCount = pins.filter((p) => p.usableForEmbedding).length;

    return NextResponse.json({
      boardId,
      importedCount: pins.length,
      usableForEmbeddingCount: usableCount,
      lowSignalCount: pins.length - usableCount,
      pins,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error importing board", code: "IMPORT_EXCEPTION", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
