/**
 * Citations Panel
 *
 * Shows policy and regulation references used to ground the evaluation.
 * Data source: case_events.metadata.citations (from policy_retrieved + regulation_retrieved events)
 */

import type { Citation } from "@/lib/types";

export function CitationsPanel({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) {
    return (
      <PanelShell title="Citations">
        <p className="text-sm font-sans text-on-surface-muted italic">
          Citations will appear after policy retrieval.
        </p>
      </PanelShell>
    );
  }

  const policies = citations.filter((c) => c.source_type === "policy");
  const regulations = citations.filter((c) => c.source_type === "regulation");

  return (
    <PanelShell title="Citations">
      {policies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-3">Company Policies</h3>
          <div className="mt-3 space-y-4">
            {policies.map((c, i) => (
              <CitationItem key={`p-${i}`} citation={c} />
            ))}
          </div>
        </div>
      )}

      {regulations.length > 0 && (
        <div className="mb-2">
          <h3 className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-3">Regulations</h3>
          <div className="mt-3 space-y-4">
            {regulations.map((c, i) => (
              <CitationItem key={`r-${i}`} citation={c} />
            ))}
          </div>
        </div>
      )}
    </PanelShell>
  );
}

function CitationItem({ citation }: { citation: Citation }) {
  const isPolicy = citation.source_type === "policy";

  return (
    <div className="rounded-sm border border-[var(--color-border-ghost)] bg-base p-5 transition-colors hover:border-[var(--color-border-solid)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-sans font-bold text-on-base">{citation.section_label}</p>
          <p className="mt-1 text-xs font-sans font-medium uppercase tracking-wider text-on-surface-muted/80">{citation.source_title}</p>
        </div>
        <span
          className={`shrink-0 rounded-sm px-2 py-1 text-[9px] font-sans font-bold uppercase tracking-widest border ${
            isPolicy
              ? "bg-surface text-primary border-[var(--color-border-solid)]"
              : "bg-surface-low text-on-surface-muted border-[var(--color-border-ghost)]"
          }`}
        >
          {citation.source_type}
        </span>
      </div>
      <blockquote className="mt-4 border-l-[1.5px] border-primary/30 pl-4">
        <p className="text-sm font-serif italic text-on-surface-muted leading-relaxed line-clamp-4">
          &quot;{citation.excerpt}&quot;
        </p>
      </blockquote>
    </div>
  );
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-[var(--color-border-solid)] bg-surface-low p-6 sm:p-8 shadow-sm">
      <h2 className="mb-6 border-b border-[var(--color-border-ghost)] pb-4 text-xs font-serif font-bold uppercase tracking-widest text-primary">
        {title}
      </h2>
      {children}
    </div>
  );
}
