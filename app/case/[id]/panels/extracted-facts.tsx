/**
 * Extracted Facts Panel
 *
 * Shows structured facts and timeline extracted from the complaint.
 * Data source: case_events.metadata.facts (from extraction_complete event)
 * Data source: case_events.metadata.entries (from timeline_assembled event)
 */

import type { ExtractedFacts } from "@/lib/pipeline/steps/extraction";
import type { TimelineEntry } from "@/lib/pipeline/steps/timeline";

export function ExtractedFactsPanel({
  facts,
  timeline,
}: {
  facts: ExtractedFacts | null;
  timeline: TimelineEntry[] | null;
}) {
  if (!facts) {
    return (
      <PanelShell title="Extracted Facts">
        <p className="text-sm font-sans text-on-surface-muted italic">
          Facts will appear here after the pipeline processes this complaint.
        </p>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Extracted Facts">
      <div className="mb-8">
        <h3 className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-2">Summary</h3>
        <p className="leading-relaxed text-sm font-sans text-on-base">{facts.complaint_summary}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-y-6 gap-x-4">
        <DetailItem label="Merchant" value={facts.merchant_name} />
        <DetailItem label="Product / Service" value={facts.product_or_service} />
        <DetailItem label="Order ID" value={facts.order_id} />
        <DetailItem
          label="Amount"
          value={facts.amount ? `${facts.currency} ${facts.amount.toLocaleString()}` : null}
        />
        <DetailItem label="Desired Resolution" value={facts.desired_resolution} className="col-span-2" />
      </div>

      {facts.issues.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-3">Issues Identified</h3>
          <ul className="space-y-2">
            {facts.issues.map((issue, i) => (
              <li key={i} className="flex gap-3 text-sm font-sans text-on-base">
                <span className="shrink-0 text-primary/60 mt-0.5">•</span>
                <span className="leading-relaxed">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {facts.consumer_actions_taken.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-3">Actions Already Taken</h3>
          <ul className="space-y-2">
            {facts.consumer_actions_taken.map((action, i) => (
              <li key={i} className="flex gap-3 text-sm font-sans text-on-surface-muted">
                <span className="shrink-0 text-primary/60 mt-0.5">•</span>
                <span className="leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {facts.merchant_responses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-3">Merchant Responses</h3>
          <ul className="space-y-2">
            {facts.merchant_responses.map((resp, i) => (
              <li key={i} className="flex gap-3 text-sm font-sans text-on-surface-muted">
                <span className="shrink-0 text-primary/60 mt-0.5">•</span>
                <span className="leading-relaxed">{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {timeline && timeline.length > 0 && (
        <div className="pt-2">
          <h3 className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-5">Timeline of Events</h3>
          <div className="relative border-l-[1.5px] border-[var(--color-border-ghost)] ml-2.5 space-y-6">
            {timeline.map((entry, i) => (
              <div key={i} className="relative pl-6">
                <span className="absolute -left-[4.5px] top-1.5 h-[7px] w-[7px] bg-primary rounded-full ring-4 ring-surface-low" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-on-surface-muted/70">
                    {entry.date || "Unknown Date"}
                  </span>
                  <span className="text-sm font-sans text-on-base leading-snug">{entry.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PanelShell>
  );
}

function DetailItem({ label, value, className = "" }: { label: string; value: string | null | undefined; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80">{label}</p>
      <p className="mt-1 text-sm font-sans text-on-base leading-relaxed">{value ?? "—"}</p>
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
