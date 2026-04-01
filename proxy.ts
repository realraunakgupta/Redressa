/**
 * Next.js Proxy (formerly Middleware) — Route Protection + Session Refresh
 *
 * Protected routes (require sign-in):
 *   /new          → claim intake form
 *   /api/pipeline → pipeline execution
 *
 * Public routes (always accessible):
 *   /             → homepage
 *   /login        → sign-in page
 *   /auth/*       → OAuth callbacks
 *   /case/*       → case view (data scoped server-side)
 *   /status       → status page
 *   /api/health   → health check
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PATHS = ["/new", "/api/pipeline"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh session (extends expiry, writes new cookie if needed)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect unauthenticated users from protected routes to /login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authenticated users away from /login
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
