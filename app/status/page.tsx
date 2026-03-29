import Link from "next/link";

import { isSupabaseConfigured, isGeminiConfigured } from "@/lib/env";

/**
 * /status - Deployment status page
 *
 * Shows service configuration status at a glance.
 * Safe to render even without any env vars set.
 * Useful for verifying Vercel deployment is working.
 */
export default function StatusPage() {
  const supabase = isSupabaseConfigured();
  const gemini = isGeminiConfigured();
  const allGood = supabase && gemini;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-neutral-50">
          Redressa <span className="text-primary-400">AI</span>
          <span className="ml-3 text-sm font-normal text-neutral-500">v0.1.0</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-500">Deployment Status</p>

        <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                allGood ? "bg-success-500" : "bg-accent-400"
              }`}
            />
            <span className="text-lg font-semibold text-neutral-100">
              {allGood ? "All Systems Configured" : "Setup In Progress"}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <ServiceCheck
              name="Supabase (Database)"
              configured={supabase}
              hint="Set NEXT_PUBLIC_SUPABASE_URL and keys in env vars"
            />
            <ServiceCheck
              name="Gemini (AI)"
              configured={gemini}
              hint="Set GEMINI_API_KEY in env vars"
            />
            <ServiceCheck
              name="App Deployment"
              configured={true}
              hint="If you can see this page, the app is deployed"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4 text-sm">
          <Link
            href="/"
            className="text-primary-400 transition-colors hover:text-primary-300"
          >
            Home
          </Link>
          <Link
            href="/api/health"
            className="text-primary-400 transition-colors hover:text-primary-300"
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
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-neutral-200">{name}</p>
        {!configured && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
      </div>
      <span
        className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          configured
            ? "bg-success-500/10 text-success-500"
            : "bg-accent-500/10 text-accent-400"
        }`}
      >
        {configured ? "Ready" : "Pending"}
      </span>
    </div>
  );
}
