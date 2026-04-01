import { generateJSON } from "@/lib/groq/client";

export type ReplyCategory = 
  | "resolved"
  | "partial_resolution"
  | "stalling"
  | "asking_for_info"
  | "rejecting_liability"
  | "escalating_internally"
  | "unclear";

export interface ReplyClassificationResult {
  category: ReplyCategory;
  reason: string;
}

const REPLY_CLASSIFICATION_INSTRUCTION = `You are a consumer redressal AI assistant analyzing an incoming email reply from a merchant/provider.
Your job is to read the complaint context, the recent outbound message, and the new inbound reply, then classify the merchant's intent accurately.

Always return valid JSON in the exact format:
{
  "category": "one_of_the_allowed_categories",
  "reason": "1-2 short sentences explaining why"
}

Allowed Categories:
1. "resolved" (They issued full refund, provided replacement, or fully fixed the issue)
2. "partial_resolution" (They offered partial refund, store credit, or a fix that doesn't fully meet demands)
3. "stalling" (They claim they are looking into it, passed it to another team without timeline, or gave generic bot response)
4. "asking_for_info" (They requested PNR, order ID, photos, tickets, or user details to proceed)
5. "rejecting_liability" (They state they are not responsible, blamed the customer, or refused demands flat out)
6. "escalating_internally" (They explicitly escalated to a senior team or grievance officer with clear indication of serious review)
7. "unclear" (The reply is completely unintelligible or unrelated)
`;

export async function stepReplyClassification(
  complaintSummary: string,
  outboundBody: string,
  inboundBody: string
): Promise<ReplyClassificationResult> {
  const prompt = `Please classify the following merchant reply.

---CONTEXT---
Original Complaint: ${complaintSummary}

---LAST OUTBOUND MESSAGE TO MERCHANT---
${outboundBody}

---NEW INBOUND REPLY FROM MERCHANT---
${inboundBody}
`;

  return generateJSON<ReplyClassificationResult>({
    prompt,
    systemInstruction: REPLY_CLASSIFICATION_INSTRUCTION,
    temperature: 0.1,
  });
}
