/**
 * Recommendation Panel
 *
 * Shows evaluation assessment and escalation routes.
 * Data source: case_events.metadata.evaluation (from evaluation_complete event)
 * Data source: case_events.metadata.routes (from route_recommended event)
 */

import type { EvaluationResult } from "@/lib/pipeline/steps/evaluation";
import type { EscalationRoute } from "@/lib/types";

export function RecommendationPanel({
  evaluation,
  routes,
}: {
  evaluation: EvaluationResult | null;
  routes: EscalationRoute[] | null;
}) {
  if (!evaluation && !routes) {
    return (
      <PanelShell title="Recommendation">
        <p className="text-sm font-sans text-on-surface-muted italic">Recommendations will appear after evaluation.</p>
      </PanelShell>
    );
  }

  const assessmentColors: Record<string, string> = {
    strong: "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20",
    moderate: "bg-primary/5 text-primary border border-primary/20",
    weak: "bg-surface text-on-surface-muted border border-[var(--color-border-solid)]",
  };

  return (
    <PanelShell title="Recommendation">
      {evaluation && (
        <div className="mb-8">
          <p className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-2">Case Strength</p>
          <span
            className={`inline-block rounded-sm px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-widest ${
              assessmentColors[evaluation.overall_assessment.toLowerCase()] ?? assessmentColors.moderate
            }`}
          >
            [ {evaluation.overall_assessment} ]
          </span>
        </div>
      )}

      {evaluation && evaluation.consumer_rights_violated.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-3">Rights Violated</h3>
          <ul className="space-y-2">
            {evaluation.consumer_rights_violated.map((violation, i) => (
              <li key={i} className="flex gap-3 text-sm font-sans text-[var(--color-error)]">
                <span className="shrink-0 mt-0.5 opacity-60">•</span>
                <span className="leading-relaxed">{violation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation && evaluation.recommended_actions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-3">Recommended Actions</h3>
          <ul className="space-y-3">
            {evaluation.recommended_actions.map((action, i) => (
              <li key={i} className="flex gap-3 text-sm font-sans text-on-base">
                <span className="shrink-0 text-[10px] font-bold text-primary px-1.5 py-0.5 border border-[var(--color-border-ghost)] rounded-sm bg-base mt-0.5 h-fit">{i + 1}</span>
                <span className="leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {routes && routes.length > 0 && (
        <div className="pt-2">
          <h3 className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted opacity-80 mb-4">Escalation Path</h3>
          <div className="space-y-4">
            {routes.map((route, i) => (
              <div
                key={i}
                className="rounded-sm border border-[var(--color-border-ghost)] bg-base p-5 transition-colors hover:border-[var(--color-border-solid)]"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-[var(--color-border-solid)] bg-surface text-[10px] font-sans font-bold text-on-base">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-sans font-bold text-on-base leading-snug">{route.target_name}</p>
                    {route.contact_info && (
                      <p className="mt-1 text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-muted/60">
                        VIA: {route.contact_info}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 border-t border-[var(--color-border-ghost)] pt-4">
                  <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-primary/70 mb-2">
                    System Rationale
                  </p>
                  <p className="text-sm font-sans text-on-surface-muted leading-relaxed">
                    {route.rationale}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
