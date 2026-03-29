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
        <p className="text-sm text-neutral-600">
          Facts will appear here after the pipeline processes this complaint.
        </p>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Extracted Facts">
      <div className="mb-5">
        <h3 className="text-xs font-medium uppercase text-neutral-500">Summary</h3>
        <p className="mt-1.5 leading-relaxed text-neutral-200">{facts.complaint_summary}</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <DetailItem label="Merchant" value={facts.merchant_name} />
        <DetailItem label="Product / Service" value={facts.product_or_service} />
        <DetailItem label="Order ID" value={facts.order_id} />
        <DetailItem
          label="Amount"
          value={facts.amount ? `${facts.currency} ${facts.amount.toLocaleString()}` : null}
        />
        <DetailItem label="Desired Resolution" value={facts.desired_resolution} />
      </div>

      {facts.issues.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-medium uppercase text-neutral-500">Issues Identified</h3>
          <ul className="mt-1.5 space-y-1">
            {facts.issues.map((issue, i) => (
              <li key={i} className="flex gap-2 text-sm text-neutral-300">
                <span className="shrink-0 text-neutral-600">-</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {facts.consumer_actions_taken.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-medium uppercase text-neutral-500">Actions Already Taken</h3>
          <ul className="mt-1.5 space-y-1">
            {facts.consumer_actions_taken.map((action, i) => (
              <li key={i} className="flex gap-2 text-sm text-neutral-400">
                <span className="shrink-0 text-neutral-600">-</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {facts.merchant_responses.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-medium uppercase text-neutral-500">Merchant Responses</h3>
          <ul className="mt-1.5 space-y-1">
            {facts.merchant_responses.map((resp, i) => (
              <li key={i} className="flex gap-2 text-sm text-neutral-400">
                <span className="shrink-0 text-neutral-600">-</span>
                {resp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {timeline && timeline.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase text-neutral-500">Timeline</h3>
          <div className="mt-2 space-y-2">
            {timeline.map((entry, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="w-24 shrink-0 tabular-nums text-neutral-500">
                  {entry.date || "-"}
                </span>
                <span className="text-neutral-300">{entry.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PanelShell>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-0.5 text-sm text-neutral-200">{value ?? "-"}</p>
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
