"use client";

import { useState, useEffect, useRef } from "react";

interface TeamMember {
  name: string;
  role: string;
  github: string;
  linkedin: string;
  initial: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Anurag Mishra",
    role: "Problem framing, policy/research grounding, and presentation narrative.",
    github: "https://github.com/Anurag-Ops",
    linkedin: "https://www.linkedin.com/in/anurag-mishra-09a2292ab/",
    initial: "A",
  },
  {
    name: "Mihir Kumar",
    role: "Frontend and UI/UX.",
    github: "https://github.com/kumamihir",
    linkedin: "https://www.linkedin.com/in/mihir-kumar-93b6b4325/",
    initial: "M",
  },
  {
    name: "Raunak Gupta",
    role: "Core backend, AI pipeline, and integrations.",
    github: "https://github.com/realraunakgupta",
    linkedin: "https://www.linkedin.com/in/realraunakgupta",
    initial: "R",
  },
  {
    name: "Yash Pandey",
    role: "Testing, feature integration, and demo validation.",
    github: "https://github.com/modijiyash",
    linkedin: "https://www.linkedin.com/in/yash-pandey-0786b3317/",
    initial: "Y",
  },
];

export function TeamModal() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm italic tracking-wide text-on-surface-muted/60 hover:text-primary transition-colors cursor-pointer"
      >
        Made by team Yin and Yang
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-end p-4 sm:p-6 pointer-events-none">
          {/* Backdrop — subtle */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => setOpen(false)}
          />

          {/* PiP Card */}
          <div
            ref={modalRef}
            className="pointer-events-auto relative w-full max-w-md rounded-sm border border-[var(--color-border-solid)] bg-base shadow-2xl overflow-hidden animate-in"
            style={{
              animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-ghost)] px-6 py-5">
              <div>
                <h3 className="text-base font-serif font-medium text-on-base tracking-tight">
                  Team Yin and Yang
                </h3>
                <p className="text-[10px] font-sans font-medium uppercase tracking-widest text-on-surface-muted/60 mt-1">
                  Protex Hack-2-Win 2026
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-[var(--color-border-ghost)] text-on-surface-muted hover:text-on-base hover:border-[var(--color-border-solid)] transition-colors text-xs"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Members */}
            <div className="divide-y divide-[var(--color-border-ghost)]/50 max-h-[60vh] overflow-y-auto">
              {TEAM_MEMBERS.map((member) => (
                <div key={member.name} className="px-6 py-5 flex gap-4 items-start group">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-sm font-serif font-medium text-primary">
                    {member.initial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-serif font-medium text-on-base">
                      {member.name}
                    </div>
                    <p className="text-xs font-sans text-on-surface-muted/70 mt-1 leading-relaxed">
                      {member.role}
                    </p>

                    {/* Links */}
                    <div className="flex gap-4 mt-3">
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface-muted hover:text-primary transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        GitHub
                      </a>
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface-muted hover:text-primary transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--color-border-ghost)] px-6 py-4">
              <p className="text-[10px] font-sans text-on-surface-muted/40 uppercase tracking-widest text-center">
                Redressa · Authority in Resolution
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
