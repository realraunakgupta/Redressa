"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserAuthClient } from "@/lib/supabase/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/";

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseBrowserAuthClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    document.cookie = `auth_next_redirect=${encodeURIComponent(next)}; path=/; max-age=300`;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        scopes:
          "email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isSignUp) {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else {
        router.push(next);
      }
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push(next);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 border-b-2 border-primary pb-2">
          <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </div>
        <Link href="/" className="block text-3xl font-serif font-medium tracking-tight text-on-base">
          Redressa
        </Link>
        <h2 className="mt-4 text-xl font-sans font-medium text-on-surface-muted">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm font-sans text-on-surface-muted/60">
          {isSignUp
            ? "Sign up to track, automate, and escalate your consumer grievances."
            : "Log in to manage your consumer claims and automation."}
        </p>
      </div>

      <div className="relative w-full max-w-sm overflow-hidden rounded-sm border border-[var(--color-border-solid)] bg-surface-low p-8 shadow-2xl">

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-sm border border-[var(--color-border-solid)] bg-base px-4 py-3 font-sans font-medium text-on-base transition hover:bg-surface focus:outline-none focus:border-primary disabled:opacity-70"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="my-8 flex items-center">
          <div className="flex-grow border-t border-[var(--color-border-ghost)]" />
          <span className="shrink-0 px-4 text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface-muted/50">
            or use email
          </span>
          <div className="flex-grow border-t border-[var(--color-border-ghost)]" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-sans font-medium uppercase tracking-wider text-on-surface-muted/80" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input-editorial w-full py-2 text-base"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-sans font-medium uppercase tracking-wider text-on-surface-muted/80" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              className="input-editorial w-full py-2 text-base"
            />
          </div>

          {error && (
            <div className="border border-[var(--color-error)] bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="mt-6 w-full btn-primary py-3"
          >
            {loading ? "Authenticating..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-sm font-sans text-on-surface-muted/70">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          className="font-medium text-on-surface-muted underline decoration-[var(--color-border-ghost)] underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
        >
          {isSignUp ? "Log in" : "Sign up"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-base" />}>
      <LoginForm />
    </Suspense>
  );
}
