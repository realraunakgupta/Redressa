/**
 * Pipeline Step: Fact Extraction
 *
 * Uses Gemini to extract structured facts from complaint description + evidence.
 * Outputs normalized data for downstream steps.
 */

import { generateJSON } from "@/lib/groq/client";
import { addCaseEvent } from "@/lib/supabase/helpers";
import type { ParsedEvidence } from "./parsing";

export interface ExtractedFacts {
  complaint_summary: string;
  merchant_name: string | null;
  product_or_service: string | null;
  order_id: string | null;
  amount: number | null;
  currency: string;
  dates: { label: string; date: string }[];
  issues: string[];
  consumer_actions_taken: string[];
  merchant_responses: string[];
  desired_resolution: string | null;
}

const SYSTEM_INSTRUCTION = `You are a consumer complaint fact extractor for Indian consumers.
Extract structured facts from the complaint description and any evidence text.
Be precise. Use dates in YYYY-MM-DD format where possible.
If information is not available, use null.
Return valid JSON matching the requested schema exactly.`;

export async function stepExtraction(
  caseId: string,
  description: string,
  evidence: ParsedEvidence[]
): Promise<ExtractedFacts> {
  const evidenceText = evidence
    .filter((e) => e.parsed_text && !e.parsed_text.startsWith("["))
    .map((e) => `[${e.file_name}]: ${e.parsed_text}`)
    .join("\n\n");

  const prompt = `Extract structured facts from this consumer complaint.

COMPLAINT:
${description}

${evidenceText ? `EVIDENCE:\n${evidenceText}` : "No additional evidence provided."}

Return JSON with this exact schema:
{
  "complaint_summary": "one paragraph summary of the complaint",
  "merchant_name": "company name or null",
  "product_or_service": "what was purchased or null",
  "order_id": "order/booking reference or null",
  "amount": numeric amount or null,
  "currency": "INR",
  "dates": [{"label": "what happened", "date": "YYYY-MM-DD"}],
  "issues": ["list of specific issues"],
  "consumer_actions_taken": ["steps already taken by consumer"],
  "merchant_responses": ["how merchant responded"],
  "desired_resolution": "what the consumer wants or null"
}`;

  const facts = await generateJSON<ExtractedFacts>({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.1,
  });

  await addCaseEvent({
    case_id: caseId,
    event_type: "extraction_complete",
    title: "Facts extracted",
    detail: `${facts.issues.length} issue(s) identified | ${facts.dates.length} date(s) found`,
    metadata: {
      issue_count: facts.issues.length,
      date_count: facts.dates.length,
      has_amount: facts.amount !== null,
      facts,
    },
  });

  return facts;
}
