import Link from "next/link";

import { isSupabaseConfigured, isGroqConfigured, isOcrSpaceConfigured, isGoogleAuthConfigured, isGeminiConfigured } from "@/lib/env";

/**
 * /status - Deployment status page
 *
 * Shows service configuration status at a glance.
 * Safe to render even without any env vars set.
 * Useful for verifying Vercel deployment is working.
 */
export default function StatusPage() {
  const supabase = isSupabaseConfigured();
  const groq = isGroqConfigured();
  const ocr = isOcrSpaceConfigured();
  const auth = isGoogleAuthConfigured();
  const gemini = isGeminiConfigured();
  const coreGood = supabase && groq && ocr;

  return (
    <main className="flex min-h-screen flex-col items-center py-20 px-6 bg-base">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl font-serif font-medium text-on-base tracking-tight">
          Redressa
          <span className="ml-3 text-sm font-sans font-medium text-on-surface-muted italic">v0.1.0</span>
        </h1>
        <p className="mt-2 text-sm font-sans text-on-surface-muted/70 uppercase tracking-widest">System Diagnostics</p>

        <div className="mt-12 border-t border-[var(--color-border-ghost)] pt-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-lg font-serif font-medium text-on-base">
              {coreGood ? "Core Pipeline Online" : "Core Setup In Progress"}
            </span>
            <span className="text-sm font-sans text-on-surface-muted">
              {coreGood ? "[ Nominal ]" : "[ Degraded ]"}
            </span>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="mb-4 border-b border-[var(--color-border-solid)] pb-2 text-xs font-sans font-semibold text-on-surface-muted/60 uppercase tracking-widest">Core Infrastructure</h3>
              <div className="space-y-4">
                <ServiceCheck
                  name="Supabase (Database)"
                  configured={supabase}
                  hint="Set NEXT_PUBLIC_SUPABASE_URL and keys"
                />
                <ServiceCheck
                  name="Groq (AI Reasoning)"
                  configured={groq}
                  hint="Set GROQ_API_KEY in env vars"
                />
                <ServiceCheck
                  name="OCR.space (Document Parsing)"
                  configured={ocr}
                  hint="Set OCR_SPACE_API_KEY in env vars"
                />
              </div>
            </div>

            <div className="pt-6">
              <h3 className="mb-4 border-b border-[var(--color-border-solid)] pb-2 text-xs font-sans font-semibold text-on-surface-muted/60 uppercase tracking-widest">Communication</h3>
              <div className="space-y-4">
                <ServiceCheck
                  name="Google Auth & Gmail API"
                  configured={auth}
                  hint="Requires OAuth credentials"
                />
              </div>
            </div>

            <div className="pt-6">
               <h3 className="mb-4 border-b border-[var(--color-border-solid)] pb-2 text-xs font-sans font-semibold text-on-surface-muted/60 uppercase tracking-widest">Redundancy</h3>
               <div className="space-y-4">
                 <ServiceCheck
                   name="Gemini Fallback"
                   configured={gemini}
                   hint="Optional secondary reasoning"
                 />
                 <ServiceCheck
                   name="App Deployment"
                   configured={true}
                   hint="Framework active"
                 />
               </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex gap-6 text-sm font-sans font-medium">
          <Link
            href="/"
            className="text-on-surface-muted hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
          >
            Home
          </Link>
          <Link
            href="/api/health"
            className="text-on-surface-muted hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
          >
            API Health
          </Link>
        </div>
      </div>
    </main>
  );
}

function ServiceCheck({
  name,
  configured,
  hint,
}: {
  name: string;
  configured: boolean;
  hint: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 font-sans">
      <div>
        <p className="text-sm font-medium text-on-base">{name}</p>
        {!configured && <p className="mt-1 text-xs text-on-surface-muted/60 max-w-[250px]">{hint}</p>}
      </div>
      <span
        className={`mt-0.5 shrink-0 text-xs font-medium tracking-widest uppercase ${
          configured ? "text-on-surface-muted" : "text-primary/80"
        }`}
      >
        {configured ? "[ Active ]" : "[ Pending ]"}
      </span>
    </div>
  );
}
