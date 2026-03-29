/**
 * Case Data Loader
 *
 * Fetches all data needed to render the case page.
 * Reads from persisted backend state:
 * - case row
 * - case_events (agent activity log)
 * - case_events.metadata (intermediate pipeline artifacts)
 * - generated_outputs (deliverable documents)
 */

import {
  getCase,
  getCaseEvents,
  getCaseOutputs,
  getLatestCaseEventByType,
} from "@/lib/supabase";
import type { CaseRow, CaseEventRow, GeneratedOutputRow } from "@/lib/supabase";
import type { Citation, EscalationRoute } from "@/lib/types";
import type { ExtractedFacts } from "@/lib/pipeline/steps/extraction";
import type { TimelineEntry } from "@/lib/pipeline/steps/timeline";
import type { EvaluationResult } from "@/lib/pipeline/steps/evaluation";

// ---- Types ----

export interface CasePageData {
  caseRow: CaseRow;
  events: CaseEventRow[];
  outputs: GeneratedOutputRow[];
  facts: ExtractedFacts | null;
  timeline: TimelineEntry[] | null;
  evaluation: EvaluationResult | null;
  routes: EscalationRoute[] | null;
  policyCitations: Citation[] | null;
  regulationCitations: Citation[] | null;
}

// ---- Loader ----

export async function loadCasePageData(caseId: string): Promise<CasePageData | null> {
  const caseRow = await getCase(caseId);
  if (!caseRow) return null;

  // Fetch all events and outputs in parallel
  const [events, outputs] = await Promise.all([
    getCaseEvents(caseId),
    getCaseOutputs(caseId),
  ]);

  // Extract intermediate artifacts from event metadata
  const [
    extractionEvent,
    timelineEvent,
    evaluationEvent,
    routeEvent,
    policyEvent,
    regulationEvent,
  ] = await Promise.all([
    getLatestCaseEventByType(caseId, "extraction_complete"),
    getLatestCaseEventByType(caseId, "timeline_assembled"),
    getLatestCaseEventByType(caseId, "evaluation_complete"),
    getLatestCaseEventByType(caseId, "route_recommended"),
    getLatestCaseEventByType(caseId, "policy_retrieved"),
    getLatestCaseEventByType(caseId, "regulation_retrieved"),
  ]);

  const meta = (event: CaseEventRow | null) =>
    (event?.metadata ?? {}) as Record<string, unknown>;

  return {
    caseRow,
    events,
    outputs,
    facts: (meta(extractionEvent).facts as ExtractedFacts) ?? null,
    timeline: (meta(timelineEvent).entries as TimelineEntry[]) ?? null,
    evaluation: (meta(evaluationEvent).evaluation as EvaluationResult) ?? null,
    routes: (meta(routeEvent).routes as EscalationRoute[]) ?? null,
    policyCitations: (meta(policyEvent).citations as Citation[]) ?? null,
    regulationCitations: (meta(regulationEvent).citations as Citation[]) ?? null,
  };
}
