// SQL migration required (run once in Supabase SQL editor):
// ALTER TABLE v2_style_profiles ADD COLUMN IF NOT EXISTS avatar_views jsonb;

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";

const VIEW_LABELS = ["Front", "Left", "Back", "Right"] as const;

type AvatarView = { label: string; url: string };

function stripDataPrefix(dataUrl: string): { mimeType: string; data: string } {
  const idx = dataUrl.indexOf(";base64,");
  if (dataUrl.startsWith("data:") && idx !== -1) {
    return { mimeType: dataUrl.slice(5, idx), data: dataUrl.slice(idx + 8) };
  }
  return { mimeType: "image/jpeg", data: dataUrl };
}

async function uploadToFal(base64DataUrl: string, filename: string): Promise<string> {
  const FAL_KEY = process.env.FAL_API_KEY;
  if (!FAL_KEY) throw new Error("FAL_API_KEY not set");

  const { mimeType, data } = stripDataPrefix(base64DataUrl);
  const binary = Buffer.from(data, "base64");

  const initRes = await fetch("https://rest.alpha.fal.ai/storage/upload/initiate", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ file_name: filename, content_type: mimeType }),
  });
  if (!initRes.ok) throw new Error(`fal.ai initiate failed: ${initRes.status}`);

  const { upload_url, file_url } = await initRes.json() as { upload_url: string; file_url: string };

  const putRes = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: binary,
  });
  if (!putRes.ok) throw new Error(`fal.ai upload failed: ${putRes.status}`);

  return file_url;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  const { data } = await db
    .from("v2_style_profiles")
    .select("avatar_views")
    .eq("pinterest_user_id", session.userId)
    .single();

  const avatarViews = (data?.avatar_views as AvatarView[] | null) ?? null;
  return NextResponse.json({ avatarViews });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { images?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const images = Array.isArray(body.images)
    ? (body.images as string[]).slice(0, 4).filter((s) => typeof s === "string" && s.length > 0)
    : [];

  if (!images.length) {
    return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
  }

  // Upload each image to fal.ai storage in parallel
  const uploadResults = await Promise.allSettled(
    images.map((img, i) =>
      uploadToFal(img, `avatar-${session.userId}-${VIEW_LABELS[i]?.toLowerCase() ?? i}-${Date.now()}.jpg`)
    )
  );

  const views: AvatarView[] = uploadResults
    .map((result, i) => ({
      label: VIEW_LABELS[i] ?? `View ${i + 1}`,
      url: result.status === "fulfilled" ? result.value : "",
    }))
    .filter((v) => v.url !== "");

  if (!views.length) {
    console.error("[avatar] all uploads failed:", uploadResults);
    return NextResponse.json({ error: "Image upload failed — check FAL_API_KEY" }, { status: 502 });
  }

  const db = createAdminClient();
  const { error } = await db
    .from("v2_style_profiles")
    .upsert(
      { pinterest_user_id: session.userId, avatar_views: views, updated_at: new Date().toISOString() },
      { onConflict: "pinterest_user_id" }
    );

  if (error) {
    console.error("[avatar] db save error:", error.message, error.code, error.details, error.hint);
    return NextResponse.json({ error: "Failed to save avatar", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ avatarViews: views });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  await db
    .from("v2_style_profiles")
    .update({ avatar_views: null })
    .eq("pinterest_user_id", session.userId);

  return NextResponse.json({ ok: true });
}
