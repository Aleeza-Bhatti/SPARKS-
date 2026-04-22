import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ProductSnapshot {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

  const { data, error } = await supabase
    .from("favorites")
    .select("product_id, product_data, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to load favorites", code: "DB_ERROR" }, { status: 500 });

  return NextResponse.json({ favorites: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

  let body: { productId?: unknown; productData?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body", code: "BAD_REQUEST" }, { status: 400 });
  }

  const productId = typeof body.productId === "string" ? body.productId.trim() : "";
  if (!productId) return NextResponse.json({ error: "productId is required", code: "BAD_REQUEST" }, { status: 400 });

  const { error } = await supabase.from("favorites").upsert(
    { user_id: user.id, product_id: productId, product_data: body.productData as ProductSnapshot },
    { onConflict: "user_id,product_id", ignoreDuplicates: true }
  );

  if (error) return NextResponse.json({ error: "Failed to save favorite", code: "DB_ERROR" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId is required", code: "BAD_REQUEST" }, { status: 400 });

  const { error } = await supabase.from("favorites").delete()
    .eq("user_id", user.id).eq("product_id", productId);

  if (error) return NextResponse.json({ error: "Failed to remove favorite", code: "DB_ERROR" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
