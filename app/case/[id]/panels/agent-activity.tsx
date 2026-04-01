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
        <p className="text-sm font-sans text-on-surface-muted italic">No activity yet.</p>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Agent Activity">
      <div className="space-y-5">
        {events.map((event) => {
          const config = EVENT_LABELS[event.event_type] ?? { label: event.event_type, icon: "--" };
          return (
            <div key={event.id} className="flex gap-4 items-start">
              <span className="mt-0.5 shrink-0 bg-base border border-[var(--color-border-solid)] rounded-sm px-1.5 pl-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-widest text-on-surface-muted/80">
                {config.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-sans text-on-base leading-snug">{event.title}</p>
                {event.detail && (
                  <p className="mt-1 break-words text-xs font-sans text-on-surface-muted/80 leading-relaxed max-w-[95%]">
                    {event.detail}
                  </p>
                )}
                <p className="mt-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-muted/50">
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
    <div className="rounded-sm border border-[var(--color-border-solid)] bg-surface-low p-6 sm:p-8 shadow-sm">
      <h2 className="mb-6 border-b border-[var(--color-border-ghost)] pb-4 text-xs font-serif font-bold uppercase tracking-widest text-primary">
        {title}
      </h2>
      {children}
    </div>
  );
}
