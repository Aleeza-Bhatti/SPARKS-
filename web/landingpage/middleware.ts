import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Set NEXT_PUBLIC_APP_OPEN=true in Vercel env vars when ready to open the app to users.
// Until then, all routes redirect to /waitlist.
const APP_OPEN = process.env.NEXT_PUBLIC_APP_OPEN === "true";

const PROTECTED = ["/feed", "/quiz", "/profile", "/favorites", "/pinterest-board"];

// Routes that are always publicly accessible regardless of APP_OPEN
const PUBLIC_PATHS = ["/waitlist", "/api/waitlist"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Waitlist-only mode: redirect everything except public paths to /waitlist
  if (!APP_OPEN) {
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (!isPublic) {
      return NextResponse.redirect(new URL("/waitlist", request.url));
    }
    return NextResponse.next({ request });
  }

  // --- App is open: run normal auth protection ---

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, let the request through — individual routes will 500 with a clear error
  // rather than crashing the middleware and taking down the whole site.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[middleware] Supabase env vars are not set");
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
    if (isProtected && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (err) {
    console.error("[middleware] Auth check failed:", err);
    const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
