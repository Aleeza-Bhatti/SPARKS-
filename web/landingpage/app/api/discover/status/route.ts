import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });

  const { data: profile } = await supabase
    .from("style_profiles")
    .select("discover_status, discover_cooldown_until")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ status: "no_profile" });
  }

  const cooldownUntil = profile.discover_cooldown_until ?? null;
  const canRunAt = cooldownUntil ? new Date(cooldownUntil).getTime() : null;

  return NextResponse.json({
    status: profile.discover_status ?? "idle",
    cooldownUntil,
    canRunAgainIn: canRunAt ? Math.max(0, Math.round((canRunAt - Date.now()) / 1000)) : 0,
  });
}
