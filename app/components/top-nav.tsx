"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserAuthClient } from "@/lib/supabase/auth";
import type { User } from "@supabase/supabase-js";

export function TopNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createSupabaseBrowserAuthClient();

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Hard refresh to clear state
  };

  return (
    <header className="relative z-10 border-b border-[var(--color-border-solid)] bg-base/80 backdrop-blur-md shrink-0">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        {/* Branding */}
        <div className="flex items-baseline gap-4">
          <Link href="/" className="text-xl font-serif font-medium tracking-tight text-on-base">
            Redressa
          </Link>
          {pathname !== "/" && (
            <span className="text-sm font-sans font-medium text-on-surface-muted hidden sm:inline-block">
              {pathname === "/new" ? "Intake Setup" : "Case Workflow"}
            </span>
          )}
        </div>

        {/* Auth / Global Actions */}
        <div className="flex items-center gap-4 lg:gap-6 font-sans">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-on-surface-muted hidden sm:inline-block truncate max-w-[200px]" title={user.email}>
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-on-surface-muted hover:text-on-base transition-colors"
                  >
                    Sign Out
                  </button>
                  {pathname !== "/new" && (
                    <Link
                      href="/new"
                      className="btn-primary ml-2 shadow-none text-xs py-2"
                    >
                      New Claim
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <Link
                    href={`/login?next=${encodeURIComponent(pathname)}`}
                    className="text-sm font-medium text-on-surface-muted hover:text-primary transition-colors"
                  >
                    Log In / Sign Up
                  </Link>
                  {pathname !== "/new" && (
                    <Link
                      href="/new"
                      className="btn-primary py-2 px-5 text-sm hidden sm:inline-flex"
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
