import { NextResponse } from "next/server";

// Redirects to the canonical Pinterest auth route
export async function GET() {
  return NextResponse.redirect(new URL("/api/pinterest/auth", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
