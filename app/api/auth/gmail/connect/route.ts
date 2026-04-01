/**
 * POST /api/auth/gmail/connect
 *
 * Initiates an incremental Google OAuth flow requesting additional Gmail scopes.
 * This should be triggered when a user clicks "Connect Gmail" to enable Assisted Mode.
 *
 * Body:
 * {
 *   "next": "/case/CASE_ID" // optional redirect after flow
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseSession = createSupabaseServerAuthClient(cookieStore);
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const nextPath = typeof body.next === "string" ? body.next : "/";
    const { origin } = new URL(request.url);

    // Request the required Gmail scopes incrementally
    const { data, error } = await supabaseSession.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        scopes: "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
        queryParams: {
          access_type: "offline",
          prompt: "consent", // Force consent screen to ensure we get a refresh token
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the authorization URL so the client can navigate to it
    const response = NextResponse.json({ url: data.url });
    // Save intended destination in cookie to survive Supabase OAuth truncation
    response.cookies.set("auth_next_redirect", nextPath, { path: "/", maxAge: 300 });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to initiate Gmail connect", detail: message }, { status: 500 });
  }
}
