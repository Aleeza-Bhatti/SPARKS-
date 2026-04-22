import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI;
const SCOPES = process.env.PINTEREST_SCOPES || "boards:read,pins:read";

export async function GET() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return NextResponse.json(
      { error: "Pinterest OAuth is not configured", code: "PINTEREST_CONFIG_MISSING" },
      { status: 500 }
    );
  }

  const state = randomBytes(24).toString("hex");
  const authUrl = new URL("https://www.pinterest.com/oauth/");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("pinterest_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return response;
}
