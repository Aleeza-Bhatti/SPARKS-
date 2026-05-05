import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { productId?: string; reason?: string };
  if (!body.productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  // TODO: persist to Supabase v2_product_reports table
  console.log(`[report] user=${session.userId} product=${body.productId} reason=${body.reason}`);

  return NextResponse.json({ ok: true });
}
