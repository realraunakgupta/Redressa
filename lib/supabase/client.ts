/**
 * Supabase Client Setup
 *
 * Two clients for different contexts:
 * - createBrowserClient(): for client components (uses anon key, respects RLS)
 * - createServerClient(): for server components / route handlers (uses service role key, bypasses RLS)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---- Browser Client (anon key, RLS enforced) ----

let browserClient: SupabaseClient | null = null;

/**
 * Create or return a cached Supabase client for browser/client components.
 * Uses the anon key - respects Row Level Security.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "[Redressa] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.example to .env.local and fill in your Supabase credentials."
    );
  }

  browserClient = createClient(url, anonKey, {
    global: {
      fetch: (fetchUrl, fetchInit) => {
        return fetch(fetchUrl, {
          ...fetchInit,
          cache: "no-store",
          keepalive: false,
        });
      },
    },
  });
  return browserClient;
}

// ---- Server Client (service role key, bypasses RLS) ----

/**
 * Create a Supabase client for server-side use (route handlers, server components, pipeline).
 * Uses the service role key - bypasses Row Level Security.
 * Creates a new instance each call to avoid cross-request state leaks.
 */
export function createServerSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "[Redressa] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Copy .env.example to .env.local and fill in your Supabase credentials."
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (fetchUrl, fetchInit) => {
        // Next.js 16 aggressively connection-pools and caches fetches causing `TypeError: fetch failed`.
        // We explicitly force disable Next's custom fetch caches for Supabase.
        return fetch(fetchUrl, {
          ...fetchInit,
          cache: "no-store",
          keepalive: false,
        });
      },
    },
  });
}
