import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("pinterest_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { error: "Pinterest is not connected", code: "PINTEREST_NOT_CONNECTED" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const pageSize = searchParams.get("page_size") || "25";
  const bookmark = searchParams.get("bookmark");

  const pinterestUrl = new URL("https://api.pinterest.com/v5/boards");
  pinterestUrl.searchParams.set("page_size", pageSize);
  if (bookmark) pinterestUrl.searchParams.set("bookmark", bookmark);

  try {
    const res = await fetch(pinterestUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch boards from Pinterest", code: "PINTEREST_BOARDS_FAILED" },
        { status: res.status }
      );
    }

    const items: Record<string, unknown>[] = Array.isArray(data.items) ? data.items : [];
    const boards = items.map((board) => ({
      id: board.id,
      name: board.name,
      description: board.description || "",
      privacy: board.privacy || "PUBLIC",
      pinCount: board.pin_count ?? 0,
    }));

    return NextResponse.json({ boards, bookmark: data.bookmark || null });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error fetching boards", code: "PINTEREST_BOARDS_EXCEPTION" },
      { status: 500 }
    );
  }
}
