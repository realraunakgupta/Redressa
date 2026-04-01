import Link from "next/link";
import { listCases } from "@/lib/supabase";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { GlassmorphicBackground } from "./components/glassmorphic-bg";
import { HeroSection } from "./components/hero-section";
import { TopNav } from "./components/top-nav";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabaseAuth = createSupabaseServerAuthClient(cookieStore);
  const { data: { user } } = await supabaseAuth.auth.getUser();

  let recentCases: Awaited<ReturnType<typeof listCases>> = [];
  if (user) {
    try {
      recentCases = await listCases({ limit: 8, userId: user.id });
    } catch {
      // Supabase may not be configured yet
    }
  }

  const statusStyle: Record<string, { label: string; dot: string; text: string }> = {
    intake: { label: "Intake", dot: "bg-neutral-400", text: "text-neutral-400" },
    processing: { label: "Processing", dot: "bg-accent-400", text: "text-accent-400" },
    evaluated: { label: "Evaluated", dot: "bg-primary-400", text: "text-primary-400" },
    complete: { label: "Complete", dot: "bg-success-500", text: "text-success-500" },
    error: { label: "Error", dot: "bg-error-500", text: "text-error-500" },
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <GlassmorphicBackground />

      <TopNav />

      {/* ── Workspace Hero ── */}
      <main className="relative z-10 flex-1">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <HeroSection />

          {/* ── Recent Cases ── */}
          <section className="mt-14">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Recent Claims
            </h2>

            {!user ? (
              <div className="mt-6 rounded-sm border border-[var(--color-border-solid)] bg-surface-low px-6 py-12 text-center shadow-lg">
                <p className="text-sm font-sans text-on-surface-muted">Sign in to view your claims.</p>
                <p className="mt-2 text-xs font-sans text-on-surface-muted/60">
                  Your claims are private and visible only to you.
                </p>
                <Link
                  href="/login"
                  className="mt-6 btn-primary"
                >
                  Sign in with Google
                </Link>
              </div>
            ) : recentCases.length === 0 ? (
              <div className="mt-6 rounded-sm border border-[var(--color-border-solid)] bg-surface-low px-8 py-10 text-center">
                <p className="text-sm font-sans text-on-surface-muted">No claims yet.</p>
                <p className="mt-2 text-xs font-sans text-on-surface-muted/60">
                  File a new claim to see it appear here.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-sm border border-[var(--color-border-solid)] bg-base">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-[var(--color-border-solid)] bg-surface-low">
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase text-on-surface-muted tracking-widest">
                        Claim
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase text-on-surface-muted tracking-widest hidden sm:table-cell">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase text-on-surface-muted tracking-widest hidden md:table-cell">
                        Filed
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase text-on-surface-muted tracking-widest">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-solid)]">
                    {recentCases.map((c) => {
                      const s = statusStyle[c.status] ?? statusStyle.intake;
                      return (
                        <tr key={c.id} className="hover:bg-surface-low transition-colors group cursor-pointer">
                          <td className="px-6 py-4">
                            <Link href={`/case/${c.id}`} className="block">
                              <p className="font-serif font-medium text-lg text-on-base truncate max-w-md group-hover:text-primary transition-colors">
                                {c.merchant_name ?? "Complaint"} —{" "}
                                {c.subcategory?.replace(/_/g, " ") ?? "General"}
                              </p>
                              <p className="mt-1.5 text-sm text-on-surface-muted truncate max-w-md">
                                {c.description.slice(0, 80)}
                                {c.description.length > 80 ? "…" : ""}
                              </p>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface-muted capitalize hidden sm:table-cell">
                            {c.category ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface-muted hidden md:table-cell">
                            {new Date(c.created_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              timeZone: "Asia/Kolkata",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
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
      <footer className="relative z-10 border-t border-[var(--color-border-solid)] bg-base">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xl font-serif font-medium text-on-base">Redressa</p>
              <p className="mt-2 text-sm font-sans text-on-surface-muted">
                Consumer redressal workflow for India.
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-y-2 text-sm font-sans text-on-surface-muted">
              <Link href="/status" className="hover:text-on-base transition-colors py-1">
                System Status
              </Link>
              <span className="py-1">Built for Protex Hack-2-Win 2026</span>
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
