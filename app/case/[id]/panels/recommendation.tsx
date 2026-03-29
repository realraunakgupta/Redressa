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
        <p className="text-sm text-neutral-600">Recommendations will appear after evaluation.</p>
      </PanelShell>
    );
  }

  const assessmentColors: Record<string, string> = {
    strong: "bg-success-500/10 text-success-500",
    moderate: "bg-accent-400/10 text-accent-400",
    weak: "bg-neutral-400/10 text-neutral-400",
  };

  return (
    <PanelShell title="Recommendation">
      {evaluation && (
        <div className="mb-4">
          <p className="text-xs uppercase text-neutral-500">Case Strength</p>
          <span
            className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${
              assessmentColors[evaluation.overall_assessment] ?? assessmentColors.moderate
            }`}
          >
            {evaluation.overall_assessment}
          </span>
        </div>
      )}

      {evaluation && evaluation.consumer_rights_violated.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium uppercase text-neutral-500">Rights Violated</h3>
          <ul className="mt-1.5 space-y-1">
            {evaluation.consumer_rights_violated.map((violation, i) => (
              <li key={i} className="text-xs leading-relaxed text-error-500">
                - {violation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation && evaluation.recommended_actions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium uppercase text-neutral-500">Recommended Actions</h3>
          <ul className="mt-1.5 space-y-1">
            {evaluation.recommended_actions.map((action, i) => (
              <li key={i} className="text-xs leading-relaxed text-neutral-300">
                {i + 1}. {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {routes && routes.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase text-neutral-500">Escalation Path</h3>
          <div className="mt-2 space-y-2.5">
            {routes.map((route, i) => (
              <div
                key={i}
                className="rounded-lg border border-neutral-800/50 bg-neutral-950/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-neutral-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-neutral-200">{route.target_name}</p>
                    {route.contact_info && (
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
                        VIA: {route.contact_info}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pl-9">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    AI Rationale
                  </p>
                  <p className="text-xs leading-relaxed text-neutral-400">
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
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </h2>
      {children}
    </div>
  );
}
