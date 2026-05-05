import { NextRequest, NextResponse } from "next/server";
import { getPinterestUser } from "@/lib/pinterest";
import { signSession, sessionCookieOptions } from "@/lib/session";

const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const expectedState = req.cookies.get("pinterest_oauth_state")?.value;

  if (oauthError) {
    return NextResponse.redirect(`${APP_URL}/?pinterest_auth=error&reason=${oauthError}`);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${APP_URL}/?pinterest_auth=error&reason=state_invalid`);
  }
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return NextResponse.redirect(`${APP_URL}/?pinterest_auth=error&reason=config_missing`);
  }

  // Exchange code for token
  const tokenRes = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
  }).catch(() => null);

  if (!tokenRes?.ok) {
    console.error("[pinterest/callback] token exchange failed:", tokenRes?.status);
    return NextResponse.redirect(`${APP_URL}/?pinterest_auth=error&reason=token_exchange_failed`);
  }

  const tokenJson = await tokenRes.json() as { access_token?: string };
  if (!tokenJson.access_token) {
    return NextResponse.redirect(`${APP_URL}/?pinterest_auth=error&reason=no_token`);
  }

  const pinterestUser = await getPinterestUser(tokenJson.access_token).catch(() => null);
  if (!pinterestUser) {
    return NextResponse.redirect(`${APP_URL}/?pinterest_auth=error&reason=user_fetch_failed`);
  }

  // Use Pinterest user ID directly — no Supabase dependency for auth
  const sessionToken = await signSession({
    userId: pinterestUser.id,
    pinterestToken: tokenJson.access_token,
  });

  // Check if returning user (has style profile in DB)
  let isReturning = false;
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const db = createAdminClient();
    const { data } = await db
      .from("v2_style_profiles")
      .select("style_tag")
      .eq("pinterest_user_id", pinterestUser.id)
      .single();
    isReturning = !!data?.style_tag;
  } catch {
    // DB check is optional — new users go to onboarding
  }

  const destination = isReturning ? `${APP_URL}/today` : `${APP_URL}/onboarding/select-board`;
  const response = NextResponse.redirect(destination);
  response.cookies.set(sessionCookieOptions(sessionToken));
  response.cookies.delete("pinterest_oauth_state");
  return response;
}
