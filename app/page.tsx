import Link from "next/link";
import { listCases } from "@/lib/supabase";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { HeroSection } from "./components/hero-section";
import { TopNav } from "./components/top-nav";
import { Footer } from "./components/footer";
import { ClaimsTable } from "./components/claims-table";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabaseAuth = createSupabaseServerAuthClient(cookieStore);
  const { data: { user } } = await supabaseAuth.auth.getUser();

  let recentCases: Awaited<ReturnType<typeof listCases>> = [];
  if (user) {
    try {
      recentCases = await listCases({ userId: user.id });
    } catch {
      // Supabase may not be configured yet
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-base">
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
              <div className="mt-6">
                <ClaimsTable cases={recentCases.map(c => ({
                  id: c.id,
                  status: c.status,
                  category: c.category,
                  subcategory: c.subcategory,
                  description: c.description,
                  merchant_name: c.merchant_name,
                  is_demo: c.is_demo,
                  created_at: c.created_at,
                }))} />
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
