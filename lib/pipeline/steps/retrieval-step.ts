/**
 * Pipeline Step: Policy & Regulation Retrieval
 *
 * Fetches relevant policy chunks and regulation chunks
 * using the deterministic keyword-based retrieval module.
 */

import { addCaseEvent } from "@/lib/supabase/helpers";
import {
  retrieveAllRelevant,
  type RetrievalResult,
} from "@/lib/pipeline/retrieval";
import type { ComplaintCategory } from "@/lib/types";

export interface RetrievalStepResult {
  policy: RetrievalResult;
  regulation: RetrievalResult;
}

export async function stepRetrieval(
  caseId: string,
  category: ComplaintCategory,
  complaintText: string,
  merchantName?: string | null
): Promise<RetrievalStepResult> {
  const { policy, regulation } = await retrieveAllRelevant({
    category,
    complaintText,
    merchantName,
    maxPerType: 5,
  });

  // Emit policy retrieval event
  await addCaseEvent({
    case_id: caseId,
    event_type: "policy_retrieved",
    title: "Company policies retrieved",
    detail: `${policy.chunks.length} relevant section(s) found`,
    metadata: {
      chunk_count: policy.chunks.length,
      documents: [...new Set(policy.chunks.map((c) => c.document_title))],
      citations: policy.citations,
      chunks: policy.chunks,
    },
  });

  // Emit regulation retrieval event
  await addCaseEvent({
    case_id: caseId,
    event_type: "regulation_retrieved",
    title: "Regulations retrieved",
    detail: `${regulation.chunks.length} relevant section(s) found`,
    metadata: {
      chunk_count: regulation.chunks.length,
      documents: [...new Set(regulation.chunks.map((c) => c.document_title))],
      citations: regulation.citations,
      chunks: regulation.chunks,
    },
  });

  return { policy, regulation };
}
