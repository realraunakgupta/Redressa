import { NextResponse } from "next/server";
import { isSupabaseConfigured, isGroqConfigured, isOcrSpaceConfigured, isGoogleAuthConfigured, isGeminiConfigured } from "@/lib/env";

/**
 * GET /api/health
 *
 * Lightweight health-check endpoint.
 * Reports status of external service configuration.
 * Does not require credentials to respond - safe to call on cold deploy.
 */
export async function GET() {
  const supabaseOk = isSupabaseConfigured();
  const groqOk = isGroqConfigured();
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

  const ocrOk = isOcrSpaceConfigured();
  const authOk = isGoogleAuthConfigured();
  const geminiOk = isGeminiConfigured();

  const status = {
    status: supabaseOk && groqOk && ocrOk ? "ok" : "degraded",
    app: "redressa",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    checks: {
      core: {
        supabase: supabaseStatus,
        groq: groqOk ? "ok" : "not_configured",
        ocr_space: ocrOk ? "ok" : "not_configured",
      },
      communication: {
        google_auth: authOk ? "ok" : "not_configured",
        gmail_send: authOk ? "ok" : "unauthorized",
      },
      fallback: {
        gemini: geminiOk ? "ok" : "not_configured"
      }
    },
  };

  return NextResponse.json(status);
}
