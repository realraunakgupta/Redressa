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
  getCaseFiles,
} from "@/lib/supabase";
import type { CaseRow, CaseEventRow, GeneratedOutputRow, CaseFileRow } from "@/lib/supabase";
import type { Citation, EscalationRoute } from "@/lib/types";
import type { ExtractedFacts } from "@/lib/pipeline/steps/extraction";
import type { TimelineEntry } from "@/lib/pipeline/steps/timeline";
import type { EvaluationResult } from "@/lib/pipeline/steps/evaluation";
import { getOAuthAccount, getThreadsForCase, getMessagesForThread, getInboundMessages } from "@/lib/supabase/helpers-communication";
import type { CommunicationThreadRow, OutboundMessageRow, InboundMessageRow } from "@/lib/supabase/types";

// ---- Types ----

export interface CasePageData {
  caseRow: CaseRow;
  events: CaseEventRow[];
  outputs: GeneratedOutputRow[];
  files: CaseFileRow[];
  parsingMetadata: Record<string, unknown> | null;
  extractionMetadata: Record<string, unknown> | null;
  facts: ExtractedFacts | null;
  timeline: TimelineEntry[] | null;
  evaluation: EvaluationResult | null;
  routes: EscalationRoute[] | null;
  policyCitations: Citation[] | null;
  regulationCitations: Citation[] | null;
  threads: CommunicationThreadRow[];
  messages: OutboundMessageRow[];
  inboundMessages: InboundMessageRow[];
  hasGmail: boolean;
}

// ---- Loader ----

export async function loadCasePageData(caseId: string, userId?: string): Promise<CasePageData | null> {
  const caseRow = await getCase(caseId, userId);
  if (!caseRow) return null;

  // Fetch all events and outputs in parallel
  const [events, outputs, files, threads] = await Promise.all([
    getCaseEvents(caseId),
    getCaseOutputs(caseId),
    getCaseFiles(caseId),
    getThreadsForCase(caseId),
  ]);

  let messages: OutboundMessageRow[] = [];
  let inboundMessages: InboundMessageRow[] = [];
  if (threads.length > 0) {
     messages = await getMessagesForThread(threads[0].id);
     inboundMessages = await getInboundMessages(threads[0].id);
  }

  let hasGmail = false;
  if (userId) {
     const oauth = await getOAuthAccount(userId);
     hasGmail = !!oauth?.access_token;
  }

  // Extract intermediate artifacts from event metadata
  const [
    parsingEvent,
    extractionEvent,
    timelineEvent,
    evaluationEvent,
    routeEvent,
    policyEvent,
    regulationEvent,
  ] = await Promise.all([
    getLatestCaseEventByType(caseId, "parsing_complete"),
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
    files,
    parsingMetadata: meta(parsingEvent),
    extractionMetadata: meta(extractionEvent),
    facts: (meta(extractionEvent).facts as ExtractedFacts) ?? null,
    timeline: (meta(timelineEvent).entries as TimelineEntry[]) ?? null,
    evaluation: (meta(evaluationEvent).evaluation as EvaluationResult) ?? null,
    routes: (meta(routeEvent).routes as EscalationRoute[]) ?? null,
    policyCitations: (meta(policyEvent).citations as Citation[]) ?? null,
    regulationCitations: (meta(regulationEvent).citations as Citation[]) ?? null,
    threads,
    messages,
    inboundMessages,
    hasGmail,
  };
}
