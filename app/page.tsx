import Link from "next/link";
import { listCases } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let recentCases: Awaited<ReturnType<typeof listCases>> = [];
  try {
    recentCases = await listCases({ limit: 8 });
  } catch {
    // Supabase may not be configured yet
  }

  const statusStyle: Record<string, { label: string; dot: string; text: string }> = {
    intake: { label: "Intake", dot: "bg-neutral-400", text: "text-neutral-400" },
    processing: { label: "Processing", dot: "bg-accent-400", text: "text-accent-400" },
    evaluated: { label: "Evaluated", dot: "bg-primary-400", text: "text-primary-400" },
    complete: { label: "Complete", dot: "bg-success-500", text: "text-success-500" },
    error: { label: "Error", dot: "bg-error-500", text: "text-error-500" },
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Bar ── */}
      <header className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight text-neutral-50">
            Redressa<span className="text-primary-500 ml-1">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/new"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
            >
              File a New Claim
            </Link>
          </div>
        </div>
      </header>

      {/* ── Workspace Hero ── */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-50">
              Consumer Redressal Workflow
            </h1>
            <p className="mt-3 text-base text-neutral-400 leading-relaxed">
              Turn messy complaint evidence into grounded, escalation-ready claim packages.
              Upload your evidence, and the agentic pipeline will extract facts, retrieve
              relevant policies, evaluate your position, and generate action-ready outputs.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <Link
                href="/new"
                className="rounded-md bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
              >
                Start New Claim
              </Link>
            </div>

            <p className="mt-4 text-xs text-neutral-600">
              Guidance workflow, not legal advice.
            </p>
          </div>

          {/* ── Recent Cases ── */}
          <section className="mt-14">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Recent Claims
            </h2>

            {recentCases.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-neutral-800 px-6 py-8 text-center">
                <p className="text-sm text-neutral-500">No claims yet.</p>
                <p className="mt-1 text-xs text-neutral-600">
                  File a new claim to see it appear here.
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-lg border border-neutral-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-800/30">
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Claim
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 hidden sm:table-cell">
                        Category
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 hidden md:table-cell">
                        Filed
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {recentCases.map((c) => {
                      const s = statusStyle[c.status] ?? statusStyle.intake;
                      return (
                        <tr key={c.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/case/${c.id}`} className="block">
                              <p className="font-medium text-neutral-200 truncate max-w-md">
                                {c.merchant_name ?? "Complaint"} —{" "}
                                {c.subcategory?.replace(/_/g, " ") ?? "General"}
                              </p>
                              <p className="mt-0.5 text-xs text-neutral-500 truncate max-w-md">
                                {c.description.slice(0, 80)}
                                {c.description.length > 80 ? "…" : ""}
                              </p>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-xs text-neutral-400 capitalize hidden sm:table-cell">
                            {c.category ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-neutral-500 hidden md:table-cell">
                            {new Date(c.created_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              timeZone: "Asia/Kolkata",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
                              <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-300">Redressa AI</p>
              <p className="mt-1 text-xs text-neutral-500">
                Agentic consumer redressal workflow for Indian consumers.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500">
              <Link href="/status" className="hover:text-neutral-300 transition-colors">
                System Status
              </Link>
              <span>Built for Protex Hack-2-Win 2026</span>
              <a
                href="https://github.com/realraunakgupta/Redressa"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-300 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <p className="mt-4 text-xs text-neutral-600">
            This tool provides informational guidance only and does not constitute legal advice.
            Always consult qualified professionals for legal matters.
          </p>
        </div>
      </footer>
    </div>
  );
}
