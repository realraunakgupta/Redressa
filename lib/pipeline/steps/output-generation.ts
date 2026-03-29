/**
 * Pipeline Step: Output Generation
 *
 * Generates the 5 deliverable outputs:
 * 1. Case Summary
 * 2. Grievance Email Draft
 * 3. Escalation Note
 * 4. Evidence Checklist
 * 5. Evidence Pack Preview
 *
 * Uses the active provider adapter for text generation, grounded in evaluation + retrieved policies.
 */

import { generateText } from "@/lib/groq/client";
import {
  addCaseEvent,
  addGeneratedOutput,
  updateCaseStatus,
} from "@/lib/supabase/helpers";
import type { Citation, EscalationRoute } from "@/lib/types";
import type { ExtractedFacts } from "./extraction";
import type { EvaluationResult } from "./evaluation";
import type { RetrievalStepResult } from "./retrieval-step";
import type { TimelineEntry } from "./timeline";

const BASE_INSTRUCTION = `You are a consumer redressal assistant for Indian consumers.
Write professional, clear, and actionable content.
Reference specific policy sections and regulations where applicable.
Do not invent facts not present in the provided context.`;

export async function stepOutputGeneration(
  caseId: string,
  facts: ExtractedFacts,
  timeline: TimelineEntry[],
  evaluation: EvaluationResult,
  routes: EscalationRoute[],
  retrieval: RetrievalStepResult
): Promise<void> {
  const allCitations: Citation[] = [
    ...retrieval.policy.citations,
    ...retrieval.regulation.citations,
  ];

  const citationsJson = allCitations.map((citation) => ({
    source_title: citation.source_title,
    section_label: citation.section_label,
    excerpt: citation.excerpt,
    source_type: citation.source_type,
  }));

  const caseSummary = await generateCaseSummary(facts, timeline, evaluation);
  await addGeneratedOutput({
    case_id: caseId,
    output_type: "case_summary",
    title: "Case Summary",
    content: caseSummary,
    citations: citationsJson,
  });

  const grievanceEmail = await generateGrievanceEmail(facts, evaluation, routes);
  await addGeneratedOutput({
    case_id: caseId,
    output_type: "grievance_email",
    title: "Grievance Email Draft",
    content: grievanceEmail,
    citations: citationsJson,
  });

  const escalationNote = await generateEscalationNote(evaluation, routes);
  await addGeneratedOutput({
    case_id: caseId,
    output_type: "escalation_note",
    title: "Escalation Note",
    content: escalationNote,
    citations: citationsJson,
  });

  const evidenceChecklist = generateEvidenceChecklist(facts, evaluation);
  await addGeneratedOutput({
    case_id: caseId,
    output_type: "evidence_checklist",
    title: "Evidence Checklist",
    content: evidenceChecklist,
    citations: [],
  });

  const packPreview = generateEvidencePackPreview(facts, timeline, evaluation, routes);
  await addGeneratedOutput({
    case_id: caseId,
    output_type: "evidence_pack_preview",
    title: "Evidence Pack Preview",
    content: packPreview,
    citations: citationsJson,
  });

  await updateCaseStatus(caseId, "complete");

  await addCaseEvent({
    case_id: caseId,
    event_type: "outputs_generated",
    title: "All outputs generated",
    detail:
      "Case summary, grievance email, escalation note, evidence checklist, and evidence pack preview generated",
    metadata: { output_count: 5 },
  });
}

async function generateCaseSummary(
  facts: ExtractedFacts,
  timeline: TimelineEntry[],
  evaluation: EvaluationResult
): Promise<string> {
  const timelineText = timeline
    .filter((entry) => entry.date)
    .map((entry) => `- ${entry.date}: ${entry.label}`)
    .join("\n");

  const prompt = `Write a professional case summary for this consumer complaint.

COMPLAINT: ${facts.complaint_summary}
MERCHANT: ${facts.merchant_name ?? "Unknown"}
AMOUNT: ${facts.amount ? `INR ${facts.amount}` : "Not specified"}
ISSUES: ${facts.issues.join(", ")}
TIMELINE:
${timelineText || "No dated events"}
ASSESSMENT: ${evaluation.overall_assessment}
VIOLATIONS FOUND: ${evaluation.consumer_rights_violated.join("; ") || "None identified"}

Write 3-5 paragraphs covering:
1. Summary of the complaint and key facts
2. Timeline of events
3. Assessment findings (what rights were violated, what obligations were unmet)
4. Recommended next steps

Use a professional tone suitable for a formal complaint.`;

  return generateText({ prompt, systemInstruction: BASE_INSTRUCTION });
}

async function generateGrievanceEmail(
  facts: ExtractedFacts,
  evaluation: EvaluationResult,
  routes: EscalationRoute[]
): Promise<string> {
  const firstRoute = routes[0];
  const prompt = `Write a formal grievance email for this consumer complaint.

TO: ${firstRoute?.target_name ?? "Customer Grievance Cell"}
COMPLAINT: ${facts.complaint_summary}
MERCHANT: ${facts.merchant_name ?? "the company"}
ORDER/REFERENCE: ${facts.order_id ?? "Not provided"}
AMOUNT: ${facts.amount ? `INR ${facts.amount}` : "Not specified"}
ISSUES: ${facts.issues.join(", ")}
CONSUMER ACTIONS ALREADY TAKEN: ${facts.consumer_actions_taken.join(", ") || "None"}
DESIRED RESOLUTION: ${facts.desired_resolution ?? "Full refund and compensation as applicable"}

VIOLATIONS TO CITE:
${evaluation.consumer_rights_violated.map((item) => `- ${item}`).join("\n")}
${evaluation.regulatory_violations.map((item) => `- ${item}`).join("\n")}

Write a formal email with:
- Subject line
- Professional greeting
- Clear statement of the problem
- Reference to specific policy/regulation violations
- Timeline of events and actions taken
- Specific resolution requested
- Reference to consumer rights and escalation if unresolved
- Professional closing

The tone should be firm but polite. Reference specific policies and regulations.`;

  return generateText({ prompt, systemInstruction: BASE_INSTRUCTION });
}

async function generateEscalationNote(
  evaluation: EvaluationResult,
  routes: EscalationRoute[]
): Promise<string> {
  const routeList = routes
    .map(
      (route, index) =>
        `${index + 1}. **${route.target_name}** (${route.target})\n   Contact: ${route.contact_info ?? "N/A"}\n   Rationale: ${route.rationale}`
    )
    .join("\n\n");

  const prompt = `Write a concise escalation note for this consumer complaint.

ASSESSMENT: ${evaluation.overall_assessment}
VIOLATIONS: ${evaluation.consumer_rights_violated.join("; ") || "None specifically identified"}
UNMET OBLIGATIONS: ${evaluation.merchant_obligations_unmet.join("; ") || "None"}
RECOMMENDED ACTIONS: ${evaluation.recommended_actions.join("; ")}

ESCALATION ROUTES (in order):
${routeList}

Write a brief note (2-3 paragraphs) explaining:
1. Why escalation is recommended
2. The step-by-step escalation path
3. What to include when escalating

Keep it actionable and clear.`;

  return generateText({ prompt, systemInstruction: BASE_INSTRUCTION });
}

function generateEvidenceChecklist(
  facts: ExtractedFacts,
  evaluation: EvaluationResult
): string {
  const items: string[] = [];

  items.push("- [ ] Original complaint description / screenshot");
  items.push("- [ ] Order confirmation / booking reference");

  if (facts.amount) {
    items.push("- [ ] Payment receipt / transaction proof");
  }

  if (facts.dates.length > 0) {
    items.push("- [ ] Communication history with dates");
  }

  if (
    facts.merchant_name?.toLowerCase().includes("indigo") ||
    facts.complaint_summary.toLowerCase().includes("flight")
  ) {
    items.push("- [ ] Boarding pass / e-ticket");
    items.push("- [ ] Flight cancellation / delay notification");
    items.push("- [ ] Airline response to complaints (if any)");
  }

  if (
    facts.complaint_summary.toLowerCase().includes("damaged") ||
    facts.complaint_summary.toLowerCase().includes("defective")
  ) {
    items.push("- [ ] Photos of damaged/defective product");
    items.push("- [ ] Unboxing video (if available)");
    items.push("- [ ] Product packaging photos");
  }

  if (evaluation.consumer_rights_violated.length > 0) {
    items.push("- [ ] Copy of relevant policy / terms referenced");
  }

  if (facts.consumer_actions_taken.length > 0) {
    items.push("- [ ] Proof of previous complaints / ticket numbers");
  }

  items.push("- [ ] ID proof (for consumer forum filing)");

  return `# Evidence Checklist\n\nGather these documents to strengthen your complaint:\n\n${items.join("\n")}`;
}

interface InternalEvidencePack {
  agentVerification: {
    assessment: string;
    evidenceTypesDetected: string[];
  };
  confirmedFacts: {
    merchant: string;
    product_or_service: string;
    order_id: string;
    amount: string;
  };
  keyIssues: string[];
  timeline: { date: string; event: string }[];
  verifiedViolations: {
    consumerRights: string[];
    merchantObligationsUnmet: string[];
  };
  missingEvidenceGaps: string[];
  escalationPath: string[];
  recommendedSteps: string[];
}

function generateEvidencePackPreview(
  facts: ExtractedFacts,
  timeline: TimelineEntry[],
  evaluation: EvaluationResult,
  routes: EscalationRoute[]
): string {
  
  // 1. Assemble the Strongly-Typed Context Layer
  const internalPack: InternalEvidencePack = {
    agentVerification: {
      assessment: evaluation.overall_assessment.toUpperCase(),
      evidenceTypesDetected: facts.evidence_types_present?.length ? facts.evidence_types_present : ["None Detected"],
    },
    confirmedFacts: {
      merchant: facts.merchant_name ?? "Unknown",
      product_or_service: facts.product_or_service ?? "Not specified",
      order_id: facts.order_id ?? "Not provided",
      amount: facts.amount ? `INR ${facts.amount}` : "Not specified",
    },
    keyIssues: facts.issues,
    timeline: timeline.filter(t => t.date).map(t => ({ date: t.date, event: t.label })),
    verifiedViolations: {
      consumerRights: evaluation.consumer_rights_violated,
      merchantObligationsUnmet: evaluation.merchant_obligations_unmet,
    },
    missingEvidenceGaps: deriveEvidenceGapLines(facts, evaluation),
    escalationPath: routes.map((r, i) => `${i + 1}. **${r.target_name}**: ${r.contact_info ?? "N/A"}`),
    recommendedSteps: evaluation.recommended_actions,
  };

  // 2. Render from Context (Pure Presentation)
  return `# Evidence Pack Preview

### 1. Confirmed Facts
- **Merchant**: ${internalPack.confirmedFacts.merchant}
- **Product/Service**: ${internalPack.confirmedFacts.product_or_service}
- **Order Reference**: ${internalPack.confirmedFacts.order_id}
- **Amount**: ${internalPack.confirmedFacts.amount}
- **Evidence Attached**: ${internalPack.agentVerification.evidenceTypesDetected.join(", ")}
- **Case Assessment**: ${internalPack.agentVerification.assessment}

**Issues Identified:**
${internalPack.keyIssues.map((issue) => `- ${issue}`).join("\n") || "- None explicitly documented"}

### 2. Timeline
| Date | Event |
|------|-------|
${internalPack.timeline.length > 0 
  ? internalPack.timeline.map((entry) => `| ${entry.date} | ${entry.event} |`).join("\n") 
  : "| - | No dated events identified by AI |"
}

### 3. Confirmed Violations
**Consumer Rights Violated:**
${internalPack.verifiedViolations.consumerRights.map((v) => `- ${v}`).join("\n") || "- None specifically identified by pipeline"}

**Merchant Obligations Unmet:**
${internalPack.verifiedViolations.merchantObligationsUnmet.map((o) => `- ${o}`).join("\n") || "- None specifically identified by pipeline"}

### 4. Likely Supporting Evidence Still Missing
${internalPack.missingEvidenceGaps.join("\n")}

### 5. Escalation Path
${internalPack.escalationPath.join("\n")}

**Recommended Next Steps:**
${internalPack.recommendedSteps.map((action) => `- ${action}`).join("\n")}

---
*** DRAFT PREVIEW ONLY - Not for final legal filing. Generated by Redressa AI. ***`;
}

function deriveEvidenceGapLines(
  facts: ExtractedFacts,
  evaluation: EvaluationResult
): string[] {
  const checklist = generateEvidenceChecklist(facts, evaluation)
    .split("\n")
    .filter((line) => line.startsWith("- [ ] "))
    .map((line) => line.replace("- [ ] ", "- "));

  return checklist.length > 0
    ? checklist
    : ["- No obvious documentation gaps were identified from the current complaint details."];
}
