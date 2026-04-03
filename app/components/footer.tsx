"use client";

import { TeamModal } from "./team-modal";

export function Footer() {
  return (
    <footer className="relative z-10 mx-auto mt-auto flex w-full max-w-7xl flex-col gap-8 border-t border-[var(--color-border-ghost)] px-6 pb-10 pt-20 sm:px-10">
      <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
        <div className="space-y-4">
          <div className="font-serif text-lg text-on-base">Redressa</div>
          <p className="max-w-xs text-sm font-sans text-on-surface-muted">
            Authority in Resolution. Empowering consumers with professional-grade
            escalation intelligence.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12">
          <div className="flex flex-col gap-3">
            <span className="mb-2 text-xs font-sans font-bold uppercase tracking-widest text-primary">
              Open Source
            </span>
            <a
              href="https://github.com/realraunakgupta/Redressa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-sans text-on-surface-muted transition-colors hover:text-on-base"
            >
              GitHub
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="mb-2 text-xs font-sans font-bold uppercase tracking-widest text-primary">
              Contact Us
            </span>
            <a
              href="mailto:guptaraunak@proton.me"
              className="text-sm font-sans text-on-surface-muted transition-colors hover:text-on-base"
            >
              Email
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 border-t border-[var(--color-border-ghost)]/50 pt-10 md:flex-row">
        <p className="text-sm tracking-wide text-on-surface-muted">
          © 2026 Redressa. Authority in Resolution.
        </p>
        <TeamModal />
      </div>
    </footer>
  );
}
