import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        {/* Logo / Title */}
        <h1 className="text-5xl font-bold tracking-tight text-neutral-50 sm:text-6xl">
          Redressa{" "}
          <span className="text-primary-400">AI</span>
        </h1>

        {/* Tagline */}
        <p className="mt-4 text-lg text-neutral-400">
          Turn messy complaint evidence into grounded, escalation-ready claim
          packages — powered by an agentic redressal workflow.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/case/new"
            className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors"
          >
            File a New Claim
          </Link>
          <Link
            href="/api/health"
            className="rounded-lg border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-300 hover:border-neutral-500 hover:text-neutral-100 transition-colors"
          >
            System Status
          </Link>
        </div>

        {/* Supported categories hint */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
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
    </main>
  );
}
