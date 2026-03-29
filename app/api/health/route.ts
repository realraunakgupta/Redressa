import { NextResponse } from "next/server";
import { isSupabaseConfigured, isGeminiConfigured } from "@/lib/env";

/**
 * GET /api/health
 *
 * Lightweight health-check endpoint.
 * Reports status of external service configuration.
 * Does not require credentials to respond - safe to call on cold deploy.
 */
export async function GET() {
  const supabaseOk = isSupabaseConfigured();
  const geminiOk = isGeminiConfigured();

  let supabaseStatus: "ok" | "not_configured" | "error" = supabaseOk
    ? "ok"
    : "not_configured";

  // If Supabase is configured, try a lightweight ping
  if (supabaseOk) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/client");
      const supabase = createServerSupabaseClient();
      const { error } = await supabase.from("cases").select("id").limit(1);
      supabaseStatus = error ? "error" : "ok";
    } catch {
      supabaseStatus = "error";
    }
  }

  const status = {
    status: supabaseOk && geminiOk ? "ok" : "degraded",
    app: "redressa-ai",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    checks: {
      supabase: supabaseStatus,
      gemini: geminiOk ? "ok" : "not_configured",
    },
  };

  return NextResponse.json(status);
}
