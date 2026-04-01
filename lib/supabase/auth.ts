/**
 * Supabase Auth Clients (@supabase/ssr)
 *
 * Separate from the data clients in client.ts.
 * These handle session cookies for Google OAuth auth.
 *
 * - createSupabaseBrowserAuthClient(): for client components (sign-in, sign-out, get session)
 * - createSupabaseServerAuthClient(): for server components / middleware (read session from cookies)
 */

import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

const url = () => {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error("[Redressa] Missing NEXT_PUBLIC_SUPABASE_URL");
  return v;
};

const anonKey = () => {
  const v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!v) throw new Error("[Redressa] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return v;
};

// ── Browser Auth Client ──────────────────────────────────────────────────────
// Use in 'use client' components: signInWithOAuth, signOut, getSession

export function createSupabaseBrowserAuthClient() {
  return createBrowserClient(url(), anonKey());
}

// ── Server Auth Client ───────────────────────────────────────────────────────
// Use in Server Components and Route Handlers to read the session.
// Requires Next.js cookies() API — import dynamically in callers.

export function createSupabaseServerAuthClient(
  cookieStore: {
    get(name: string): { value: string } | undefined;
    set(name: string, value: string, options?: CookieOptions): void;
  }
) {
  return createServerClient(url(), anonKey(), {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Middleware can call this in read-only contexts; safe to ignore
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        } catch {
          // Safe to ignore
        }
      },
    },
  });
}
