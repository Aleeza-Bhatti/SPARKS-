import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.redirect(`${APP_URL}/login?error=pinterest_failed&reason=${oauthError}`);
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${APP_URL}/login?error=pinterest_failed&reason=state_invalid`);
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return NextResponse.redirect(`${APP_URL}/login?error=pinterest_failed&reason=config_missing`);
  }

  try {
    const tokenRes = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
    });

    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok || !tokenJson.access_token) {
      return NextResponse.redirect(`${APP_URL}/login?error=pinterest_failed&reason=token_exchange_failed`);
    }

    const response = NextResponse.redirect(`${APP_URL}/pinterest-board`);
    response.cookies.set("pinterest_access_token", tokenJson.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenJson.expires_in || 3600,
      path: "/",
    });
    response.cookies.delete("pinterest_oauth_state");
    return response;
  } catch {
    return NextResponse.redirect(`${APP_URL}/login?error=pinterest_failed&reason=exception`);
  }
}
