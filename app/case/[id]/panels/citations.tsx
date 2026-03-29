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
        <p className="text-sm text-neutral-600">
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
        <div className="mb-4">
          <h3 className="text-xs font-medium uppercase text-neutral-500">Company Policies</h3>
          <div className="mt-2 space-y-3">
            {policies.map((c, i) => (
              <CitationItem key={`p-${i}`} citation={c} />
            ))}
          </div>
        </div>
      )}

      {regulations.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase text-neutral-500">Regulations</h3>
          <div className="mt-2 space-y-3">
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
    <div className="rounded-lg border border-neutral-800/50 bg-neutral-950/50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-neutral-200">{citation.section_label}</p>
          <p className="mt-0.5 text-xs text-neutral-500">{citation.source_title}</p>
        </div>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            isPolicy
              ? "bg-primary-950/50 text-primary-400 border border-primary-900/50"
              : "bg-accent-950/50 text-accent-400 border border-accent-900/50"
          }`}
        >
          {citation.source_type}
        </span>
      </div>
      <blockquote className="mt-3 border-l-2 border-neutral-700/50 pl-3">
        <p className="text-xs italic leading-relaxed text-neutral-400 line-clamp-4">
          &quot;{citation.excerpt}&quot;
        </p>
      </blockquote>
    </div>
  );
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </h2>
      {children}
    </div>
  );
}
