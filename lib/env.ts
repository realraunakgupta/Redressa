/**
 * Environment Variable Validation
 *
 * Validates required env vars at startup and provides typed access.
 * Fails fast with clear error messages if anything is missing.
 */

interface EnvConfig {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  // Gemini
  groqApiKey: string;
  // App
  appUrl: string;
}

/**
 * Get server-side environment config.
 * Only call this from server components, route handlers, or server actions.
 * Throws if any required variable is missing.
 */
export function getServerEnv(): EnvConfig {
  const missing: string[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!groqApiKey) missing.push("GROQ_API_KEY");

  if (missing.length > 0) {
    throw new Error(
      `[Redressa] Missing required environment variables: ${missing.join(", ")}.\n` +
        `Copy .env.example to .env.local and fill in your credentials.`
    );
  }

  return {
    supabaseUrl: supabaseUrl!,
    supabaseAnonKey: supabaseAnonKey!,
    supabaseServiceRoleKey: supabaseServiceRoleKey!,
    groqApiKey: groqApiKey!,
    appUrl,
  };
}

/**
 * Get client-side (public) environment config.
 * Safe to call from client components - only exposes NEXT_PUBLIC_ vars.
 */
export function getPublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[Redressa] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return { supabaseUrl, supabaseAnonKey, appUrl };
}

/**
 * Check if Supabase is configured (without throwing).
 * Useful for health checks and conditional rendering.
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Check if Groq is configured (without throwing).
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}
