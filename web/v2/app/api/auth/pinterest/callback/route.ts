import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { getPinterestUser } from "@/lib/pinterest";
import { signSession, sessionCookieOptions } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const store = await cookies();

  if (error || !code) {
    return NextResponse.redirect(new URL("/?error=pinterest_denied", request.url));
  }

  // Verify CSRF state
  const savedState = store.get("pinterest_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/?error=invalid_state", request.url));
  }
  store.delete("pinterest_oauth_state");

  // Exchange code for token
  const appId = process.env.PINTEREST_APP_ID!;
  const appSecret = process.env.PINTEREST_APP_SECRET!;
  const redirectUri = process.env.PINTEREST_REDIRECT_URI!;

  let pinterestToken: string;
  try {
    const tokenRes = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("[pinterest/callback] token exchange failed:", text);
      return NextResponse.redirect(new URL("/?error=token_exchange", request.url));
    }

    const tokenData = await tokenRes.json() as { access_token: string };
    pinterestToken = tokenData.access_token;
  } catch (err) {
    console.error("[pinterest/callback] token exchange error:", err);
    return NextResponse.redirect(new URL("/?error=token_exchange", request.url));
  }

  // Fetch Pinterest user profile
  let pinterestUser: { id: string; name: string; avatar_url: string | null };
  try {
    pinterestUser = await getPinterestUser(pinterestToken);
  } catch (err) {
    console.error("[pinterest/callback] user fetch error:", err);
    return NextResponse.redirect(new URL("/?error=user_fetch", request.url));
  }

  // Upsert user in Supabase
  const db = createAdminClient();
  const { data: user, error: dbErr } = await db
    .from("users")
    .upsert(
      {
        pinterest_user_id: pinterestUser.id,
        name: pinterestUser.name || null,
        avatar_url: pinterestUser.avatar_url,
      },
      { onConflict: "pinterest_user_id" }
    )
    .select("id")
    .single();

  if (dbErr || !user) {
    console.error("[pinterest/callback] db upsert error:", dbErr);
    return NextResponse.redirect(new URL("/?error=db_error", request.url));
  }

  // Check if user has already completed onboarding (has a style_profile)
  const { data: profile } = await db
    .from("style_profiles")
    .select("id, style_tag")
    .eq("user_id", user.id)
    .single();

  // Sign session JWT
  const token = await signSession({ userId: user.id, pinterestToken });

  // Redirect returning users straight to today feed
  const destination = profile?.style_tag ? "/today" : "/onboarding/select-board";
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(sessionCookieOptions(token));

  return response;
}
