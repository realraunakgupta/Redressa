/**
 * Pipeline Step: Grounded Evaluation
 *
 * Uses Gemini to evaluate the complaint against retrieved policies and regulations.
 * The evaluation is grounded — every claim references specific policy/regulation sections.
 */

import { generateJSON } from "@/lib/gemini/client";
import { addCaseEvent } from "@/lib/supabase/helpers";
import type { ExtractedFacts } from "./extraction";
import type { RetrievalStepResult } from "./retrieval-step";
import type { TimelineEntry } from "./timeline";

export interface EvaluationResult {
  overall_assessment: "strong" | "moderate" | "weak";
  consumer_rights_met: string[];
  consumer_rights_violated: string[];
  merchant_obligations_unmet: string[];
  regulatory_violations: string[];
  recommended_actions: string[];
  grounding_notes: string[];
}

const SYSTEM_INSTRUCTION = `You are a consumer rights evaluation agent for Indian consumers.
Evaluate complaints against company policies and regulations.
Every claim you make MUST be grounded in the provided policy/regulation text.
Do not invent rights or obligations not present in the provided documents.
Be specific about which sections support each finding.
Return valid JSON matching the requested schema.`;

export async function stepEvaluation(
  caseId: string,
  facts: ExtractedFacts,
  timeline: TimelineEntry[],
  retrieval: RetrievalStepResult
): Promise<EvaluationResult> {
  const policyContext = retrieval.policy.chunks
    .map((c) => `[${c.document_title} — ${c.section_label}]\n${c.content}`)
    .join("\n\n---\n\n");

  const regulationContext = retrieval.regulation.chunks
    .map((c) => `[${c.document_title} — ${c.section_label}]\n${c.content}`)
    .join("\n\n---\n\n");

  const timelineText = timeline
    .filter((t) => t.date)
    .map((t) => `${t.date}: ${t.label}`)
    .join("\n");

  const prompt = `Evaluate this consumer complaint against the provided policies and regulations.

COMPLAINT SUMMARY:
${facts.complaint_summary}

ISSUES:
${facts.issues.map((i) => `- ${i}`).join("\n")}

ACTIONS TAKEN BY CONSUMER:
${facts.consumer_actions_taken.map((a) => `- ${a}`).join("\n") || "None reported"}

MERCHANT RESPONSES:
${facts.merchant_responses.map((r) => `- ${r}`).join("\n") || "No response reported"}

TIMELINE:
${timelineText || "No dated events"}

COMPANY POLICIES:
${policyContext || "No relevant company policies found"}

REGULATIONS:
${regulationContext || "No relevant regulations found"}

Return JSON with this schema:
{
  "overall_assessment": "strong" | "moderate" | "weak",
  "consumer_rights_met": ["rights that were properly honored"],
  "consumer_rights_violated": ["rights that were violated, with policy/regulation reference"],
  "merchant_obligations_unmet": ["obligations the merchant failed to meet"],
  "regulatory_violations": ["specific regulation violations if any"],
  "recommended_actions": ["concrete steps the consumer should take"],
  "grounding_notes": ["references to specific policy/regulation sections that support findings"]
}`;

  const evaluation = await generateJSON<EvaluationResult>({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.2,
  });

  await addCaseEvent({
    case_id: caseId,
    event_type: "evaluation_complete",
    title: "Complaint evaluated",
    detail: `Assessment: ${evaluation.overall_assessment} | ${evaluation.consumer_rights_violated.length} violation(s) found`,
    metadata: {
      assessment: evaluation.overall_assessment,
      violations: evaluation.consumer_rights_violated.length,
      unmet_obligations: evaluation.merchant_obligations_unmet.length,
      evaluation,
    },
  });

  return evaluation;
}
