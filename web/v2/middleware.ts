import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

const APP_ROUTES = ["/today", "/search"];
const ONBOARDING_ROUTES = ["/onboarding"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApp = APP_ROUTES.some((r) => pathname.startsWith(r));
  const isOnboarding = ONBOARDING_ROUTES.some((r) => pathname.startsWith(r));

  if (!isApp && !isOnboarding) return NextResponse.next();

  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/today/:path*", "/search/:path*", "/onboarding/:path*"],
};
