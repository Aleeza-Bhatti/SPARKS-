import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/session";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );
  response.cookies.delete(COOKIE_NAME);
  return response;
}
