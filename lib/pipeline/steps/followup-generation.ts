import { generateText } from "@/lib/groq/client";
import type { ReplyCategory } from "./reply-classification";

const FOLLOWUP_INSTRUCTION = `You are an AI assisting a consumer in tracking their complaint firmly and professionally.
The merchant has responded to our last email. Based on the categorization of their response, your job is to write a highly specific, firm follow-up email.

GUIDELINES:
1. Always maintain a polite but extremely firm tone. Do not apologize.
2. If the merchant is "stalling", push for an explicit timeline or deadline for resolution within 48-72 hours.
3. If they are "rejecting_liability", reiterate the original citations/laws and warn that failure to address the concern will lead to escalation to consumer forums or regulators.
4. CRITICAL: Keep the follow-up extremely concise (1-2 short paragraphs max). Strip away all repetitive pleasantries, conversational fluff, and redundant legal backstory. Don't over-explain if the last email already did.
5. Do not include placeholders like [Your Name], we will attach that programmatically.`;

export async function stepFollowupGeneration(
  originalComplaint: string,
  lastOutboundText: string,
  merchantReplyText: string,
  merchantIntent: ReplyCategory,
  citationsFallback: string
): Promise<string> {
  const prompt = `Please draft the next follow-up message to the merchant.

---ORIGINAL COMPLAINT CONTEXT---
${originalComplaint}

---OUR LAST OUTBOUND MESSAGE---
${lastOutboundText}

---MERCHANT'S LATEST REPLY---
${merchantReplyText}

---AI CLASSIFICATION OF MERCHANT'S INTENT---
Category: ${merchantIntent}

---APPLICABLE LAWS/POLICIES (Tension leverage)---
${citationsFallback || "No specific legal citations provided earlier."}

Based on their intent (${merchantIntent}), write the follow-up draft prioritizing a quick resolution or escalation threat.`;

  return generateText({
    prompt,
    systemInstruction: FOLLOWUP_INSTRUCTION,
    temperature: 0.2, // Low temp for formal consistency
    maxTokens: 500,
  });
}
