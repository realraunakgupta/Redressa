import Link from "next/link";
import { listCases } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let recentCases: Awaited<ReturnType<typeof listCases>> = [];
  try {
    recentCases = await listCases({ limit: 5 });
  } catch {
    // Supabase may not be configured yet — fail silently
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-50 sm:text-5xl">
            Redressa{" "}
            <span className="text-primary-400">AI</span>
          </h1>

          <p className="mt-4 text-base text-neutral-400">
            Turn messy complaint evidence into grounded, escalation-ready claim
            packages — powered by an agentic redressal workflow.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/new"
              className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors"
            >
              File a New Claim
            </Link>
            <Link
              href="/status"
              className="rounded-lg border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-300 hover:border-neutral-500 hover:text-neutral-100 transition-colors"
            >
              System Status
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {["Aviation (IndiGo)", "E-Commerce (Flipkart)"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-neutral-800 bg-neutral-900 px-4 py-1.5 text-xs text-neutral-400"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Cases */}
        {recentCases.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Recent Claims
            </h2>
            <div className="mt-4 space-y-2">
              {recentCases.map((c) => {
                const statusColors: Record<string, string> = {
                  intake: "text-neutral-400",
                  processing: "text-accent-400",
                  evaluated: "text-primary-400",
                  complete: "text-success-500",
                  error: "text-error-500",
                };
                return (
                  <Link
                    key={c.id}
                    href={`/case/${c.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 hover:border-neutral-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-200 truncate">
                        {c.merchant_name ?? "Complaint"} — {c.subcategory?.replace(/_/g, " ") ?? c.category ?? "Unclassified"}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 truncate">
                        {c.description.slice(0, 100)}
                        {c.description.length > 100 ? "…" : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-xs font-medium capitalize ${statusColors[c.status] ?? "text-neutral-500"}`}>
                        {c.status}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-600">
                        {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
