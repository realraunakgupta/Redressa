/**
 * Agent Activity Panel
 *
 * Shows the full timeline of pipeline events from case_events table.
 * Data source: case_events rows (directly persisted by each pipeline step)
 */

import type { CaseEventRow } from "@/lib/supabase/types";

const EVENT_LABELS: Record<string, { label: string; icon: string }> = {
  intake_received: { label: "Complaint received", icon: "IN" },
  parsing_started: { label: "Parsing evidence", icon: "PA" },
  parsing_complete: { label: "Evidence parsed", icon: "OK" },
  extraction_complete: { label: "Facts extracted", icon: "FX" },
  timeline_assembled: { label: "Timeline assembled", icon: "TL" },
  classification_complete: { label: "Complaint classified", icon: "CL" },
  policy_retrieved: { label: "Policies retrieved", icon: "PL" },
  regulation_retrieved: { label: "Regulations retrieved", icon: "RG" },
  evaluation_complete: { label: "Evaluation done", icon: "EV" },
  route_recommended: { label: "Routes recommended", icon: "RT" },
  outputs_generated: { label: "Outputs generated", icon: "OUT" },
  error: { label: "Error", icon: "ER" },
};

export function AgentActivityPanel({ events }: { events: CaseEventRow[] }) {
  if (events.length === 0) {
    return (
      <PanelShell title="Agent Activity">
        <p className="text-sm text-neutral-600">No activity yet.</p>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Agent Activity">
      <div className="space-y-3">
        {events.map((event) => {
          const config = EVENT_LABELS[event.event_type] ?? { label: event.event_type, icon: "--" };
          return (
            <div key={event.id} className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {config.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-200">{event.title}</p>
                {event.detail && (
                  <p className="mt-0.5 break-words text-xs text-neutral-500">{event.detail}</p>
                )}
                <p className="mt-0.5 text-xs text-neutral-600">
                  {new Date(event.created_at).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "Asia/Kolkata",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </PanelShell>
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
