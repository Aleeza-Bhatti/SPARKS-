import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Get the session we just created
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("users").upsert(
      { id: user.id, email: user.email },
      { onConflict: "id", ignoreDuplicates: true }
    );

    // Check if this user has already completed the quiz
    const { data: profile } = await supabase
      .from("style_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // Returning user — skip quiz, go straight to feed
    if (profile) {
      return NextResponse.redirect(`${origin}/feed`);
    }
  }

  // New user — send to quiz
  return NextResponse.redirect(`${origin}/quiz`);
}
