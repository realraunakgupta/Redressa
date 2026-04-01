/**
 * OAuth Callback Route
 *
 * Supabase redirects here after Google OAuth completes.
 * Exchanges the code for a session and redirects to the
 * intended destination (or / by default).
 */

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = await cookies();
  
  // Safely grab the destination URL from query OR our fallback cookie
  const redirectCookieValue = cookieStore.get("auth_next_redirect")?.value;
  const next = searchParams.get("next") ?? (redirectCookieValue ? decodeURIComponent(redirectCookieValue) : "/");

  if (code) {
    const supabase = createSupabaseServerAuthClient(cookieStore);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // ── PHASE B: Gmail Token Capture ──
      // If the user went through a flow that asked for Gmail scopes, the provider_token
      // will be attached to the session *once* during this callback. We must save it.
      const session = data.session;
      if (session.user && session.provider_token) {
        try {
          // Dynamic import to avoid circular boundary issues in Next.js edge vs node
          const { upsertOAuthAccount } = await import("@/lib/supabase/helpers-communication");
          
          await upsertOAuthAccount({
            user_id: session.user.id,
            gmail_address: session.user.user_metadata?.email ?? session.user.email ?? '', // approximate, better to use people API, but metadata works
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token ?? "",
            token_expires_at: new Date(Date.now() + 3599 * 1000).toISOString(), // Google tokens typically 1hr
            scopes: ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.readonly"], // approximate since Supabase doesn't return exact scopes
          });
          console.log(`[Redressa] Saved Gmail tokens for user ${session.user.id}`);
        } catch (err: unknown) {
          console.error("[Redressa] Error saving Gmail tokens:", err);
        }
      }

      // Redirect to intended destination after successful sign-in
      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.delete("auth_next_redirect");
      return response;
    }
  }

  // Something went wrong — redirect to login with error hint
  const errorResponse = NextResponse.redirect(`${origin}/login?error=auth_failed`);
  errorResponse.cookies.delete("auth_next_redirect");
  return errorResponse;
}
