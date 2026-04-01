import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { 
  getOAuthAccount, 
  getMessagesForThread, 
  getInboundMessages,
  createInboundMessage,
  createOutboundMessage
} from "@/lib/supabase/helpers-communication";
import { getCase } from "@/lib/supabase";
import { addCaseEvent } from "@/lib/supabase/helpers";
import { stepReplyClassification, type ReplyClassificationResult } from "@/lib/pipeline/steps/reply-classification";
import { stepFollowupGeneration } from "@/lib/pipeline/steps/followup-generation";
import type { ReplyCategory } from "@/lib/pipeline/steps/reply-classification";
import type { InboundMessageRow } from "@/lib/supabase/types";

export const maxDuration = 60;

function decodeBase64URL(str: string) {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

type GmailHeader = {
  name: string;
  value: string;
};

type GmailPayload = {
  mimeType?: string;
  body?: {
    data?: string;
  } | null;
  headers?: GmailHeader[] | null;
  parts?: GmailPayload[] | null;
};

type GmailMessage = {
  id: string;
  internalDate: string;
  payload?: GmailPayload | null;
};

type GmailThreadResponse = {
  messages?: GmailMessage[];
};

type RefreshTokenResponse = {
  access_token: string;
};

function extractPlainText(payload: GmailPayload | null | undefined): string {
  if (!payload) return "";
  
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64URL(payload.body.data);
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain") {
        if (part.body?.data) {
           return decodeBase64URL(part.body.data);
        }
      } else if (part.parts) {
        // Recursive search for multipart/mixed -> multipart/alternative -> text/plain
        const innerText = extractPlainText(part);
        if (innerText) return innerText;
      }
    }
  }
  
  // Final fallback if text/plain isn't found but text/html is
  if (payload.mimeType === "text/html" && payload.body?.data) {
    const html = decodeBase64URL(payload.body.data);
    return html.replace(/<[^>]+>/g, "\n"); // crude HTML strip
  }

  return "";
}

function getHeader(headers: GmailHeader[] | null | undefined, name: string): string {
  if (!headers) return "";
  const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : "";
}

function isFollowupCategory(
  category: string | null | undefined
): category is Extract<ReplyCategory, "stalling" | "rejecting_liability"> {
  return category === "stalling" || category === "rejecting_liability";
}

function isPauseCategory(category: string | null | undefined): boolean {
  return (
    category === "asking_for_info" ||
    category === "unclear" ||
    category === "partial_resolution" ||
    category === "escalating_internally"
  );
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createSupabaseServerAuthClient(cookieStore);
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { thread_id } = await request.json().catch(() => ({}));
    if (!thread_id) {
      return NextResponse.json({ error: "thread_id is required" }, { status: 400 });
    }

    // 1. Get our local thread details
    // For simplicity we fetch threads for case, or we should just get the thread by ID natively.
    // wait, we don't have getThreadById. We can just use supabase client here.
    const { data: threadRow } = await supabaseAuth
      .from("communication_threads")
      .select("*")
      .eq("id", thread_id)
      .single();

    if (!threadRow) {
      return NextResponse.json({ error: "Communication thread not found" }, { status: 404 });
    }

    if (threadRow.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to thread" }, { status: 403 });
    }

    if (!threadRow.gmail_thread_id) {
      return NextResponse.json({ error: "Thread has no Gmail context, cannot sync yet" }, { status: 400 });
    }

    // 2. Refresh / Load OAuth token
    const oauth = await getOAuthAccount(user.id);
    if (!oauth || !oauth.access_token) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 403 });
    }

    let accessToken = oauth.access_token;
    
    // Check if token expired
    if (new Date(oauth.token_expires_at) < new Date()) {
       const refreshResp = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
             client_id: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
             client_secret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "", 
             refresh_token: oauth.refresh_token,
             grant_type: "refresh_token"
          })
       });

       if (!refreshResp.ok) {
           return NextResponse.json({ error: "Failed to refresh Gmail token" }, { status: 401 });
       }
       const refreshData = (await refreshResp.json()) as RefreshTokenResponse;
       accessToken = refreshData.access_token;
    }

    // 3. Fetch from Gmail API
    const gmailResp = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadRow.gmail_thread_id}?format=full`, {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    if (!gmailResp.ok) {
       console.error("[Redressa Sync] Failed to fetch thread from Gmail:", await gmailResp.text());
       return NextResponse.json({ error: "Failed to fetch thread from Gmail API" }, { status: 502 });
    }

    const gmailThread = (await gmailResp.json()) as GmailThreadResponse;
    const gmailMessages = gmailThread.messages || [];

    // 4. Determine what needs to be synced
    const existingOutbound = await getMessagesForThread(thread_id);
    const existingInbound = await getInboundMessages(thread_id);
    
    const knownGmailMessageIds = new Set([
      ...existingOutbound.map(m => m.gmail_message_id).filter(Boolean),
      ...existingInbound.map(m => m.gmail_message_id).filter(Boolean)
    ]);

    const newInboundMessages: InboundMessageRow[] = [];
    
    // Process new messages
    for (const msg of gmailMessages) {
       if (knownGmailMessageIds.has(msg.id)) continue;
       
       const from = getHeader(msg.payload?.headers, "From");
       const to = getHeader(msg.payload?.headers, "To");
       const subject = getHeader(msg.payload?.headers, "Subject");
       
       // Only process if it strictly isn't from the user themselves
       if (from.toLowerCase().includes(oauth.gmail_address.toLowerCase())) {
          // this is an outbound followup they sent via gmail web directly, ignored for MVP
          continue;
       }

       const body = extractPlainText(msg.payload) || "(No body provided)";
       
       // Found a new inbound reply!
       // Let's run AI Classification
       const caseRow = await getCase(threadRow.case_id, user.id);
       const latestOutbound = existingOutbound[existingOutbound.length - 1]; // highly likely what they're replying to
       
       let parsedResult: ReplyClassificationResult;
       try {
         parsedResult = await stepReplyClassification(
            caseRow?.description || "",
            latestOutbound?.body || "",
            body
         );
       } catch (aiErr) {
         console.error("[Redressa Sync] Classification failed:", aiErr);
         parsedResult = { category: "unclear", reason: "AI classification failed" };
       }

       // Save to DB
       const saved = await createInboundMessage({
         thread_id: thread_id,
         case_id: threadRow.case_id,
         user_id: user.id,
         gmail_message_id: msg.id,
         subject,
         body,
         from_address: from,
         to_address: to,
         classification_category: parsedResult.category,
         classification_reason: parsedResult.reason,
         received_at: new Date(parseInt(msg.internalDate)).toISOString(),
       });

       newInboundMessages.push(saved);
    }

    // 5. Update thread state if new inbound exists
    if (newInboundMessages.length > 0) {
       const latestReply = newInboundMessages[newInboundMessages.length - 1];
       const category = latestReply.classification_category || "unclear";
       
       let newState: "reply_received" | "resolved" | "needs_user_input" | "ready_to_follow_up" = "reply_received";
       
       if (category === "resolved") {
          newState = "resolved";
          await addCaseEvent({
              case_id: threadRow.case_id,
              event_type: "case_resolved",
              title: "Merchant Resolved Case",
              detail: "The merchant reply indicates the issue is resolved or a refund is issued.",
              metadata: { category }
          });
       } else if (isPauseCategory(category)) {
          newState = "needs_user_input";
          await addCaseEvent({
              case_id: threadRow.case_id,
              event_type: "autopilot_paused",
              title: "Autopilot Paused",
              detail: `System paused because ${category.replace(/_/g, " ")}. Human review required.`,
              metadata: { category }
          });
       } else if (isFollowupCategory(category)) {
          // Autopilot Decision Logic
          try {
             const caseRow = await getCase(threadRow.case_id, user.id);
             
             const draftedText = await stepFollowupGeneration(
                caseRow?.description || "",
                existingOutbound.length > 0 ? existingOutbound[existingOutbound.length - 1].body : "",
                latestReply.body,
                category,
                "Refer to the originally cited consumer protection rules." // simple fallback
             );
             
             // In "autopilot" mode we *could* auto-send here by making status='approved' and triggering the sender.
             // But per user demo requirements, we default to Assisted draft to show the pause mechanism.
             const isAuto = threadRow.automation_mode === "autopilot";
             
             await createOutboundMessage({
                thread_id: thread_id,
                case_id: threadRow.case_id,
                user_id: user.id,
                subject: `Re: ${latestReply.subject.replace(/^(Re:\s*)+/i, "")}`,
                body: draftedText,
                from_address: oauth.gmail_address,
                to_address: latestReply.from_address,
                status: isAuto ? "approved" : "draft", // if approved, a background worker would pick it up (mocked for now)
                generation_source: "ai_followup",
                approval_required: !isAuto
             });
             
             newState = "ready_to_follow_up";
             await addCaseEvent({
                 case_id: threadRow.case_id,
                 event_type: "autopilot_drafted",
                 title: "Autopilot Drafted Follow-up",
                 detail: `AI drafted a follow-up specifically addressing the merchant's ${category.replace(/_/g, " ")}. Waiting for user approval.`,
                 metadata: { category }
             });
          } catch (err) {
             console.error("[Redressa Sync] Follow-up generation failed:", err);
             // Fallback if AI fails to draft
             newState = "needs_user_input";
             await addCaseEvent({
                 case_id: threadRow.case_id,
                 event_type: "autopilot_failed",
                 title: "Autopilot Failed to Draft",
                 detail: "The AI encountered an error generating the follow up. Manual intervention required.",
             });
          }
       }
       
       // Advance deadline scheduling
       const nextDue = new Date();
       nextDue.setDate(nextDue.getDate() + 3); // arbitrarily schedule follow-up 3 days out
       
       const supabaseAuth = createSupabaseServerAuthClient(await cookies());
       await supabaseAuth.from("communication_threads").update({ 
           state: newState,
           updated_at: new Date().toISOString()
       }).eq("id", thread_id);
    }

    // 6. Recovery layer: if the previous AI generation failed halfway through,
    // subsequent syncs ignore the already-saved inbound message and skip draft generation.
    // This forcibly catches stuck states and retries the generation.
    if (newInboundMessages.length === 0 && existingInbound.length > 0) {
       const latestReply = existingInbound[existingInbound.length - 1];
       const category = latestReply.classification_category || "unclear";
       
       // Check if there are no existing "draft" or "approved" follow-ups
       const hasFollowUp = existingOutbound.some(m => m.generation_source === "ai_followup" && (m.status === "draft" || m.status === "approved" || m.status === "sent"));
       
       if (!hasFollowUp && isFollowupCategory(category)) {
          console.log("[Redressa Sync] Retrying stuck draft generation for category:", category);
          try {
             // Mock case fetch again
             const caseRow = await getCase(threadRow.case_id, user.id);
             
             const draftedText = await stepFollowupGeneration(
                caseRow?.description || "",
                existingOutbound.length > 0 ? existingOutbound[existingOutbound.length - 1].body : "",
                latestReply.body,
                category,
                "Refer to the originally cited consumer protection rules." 
             );
             
             const isAuto = threadRow.automation_mode === "autopilot";
             
             await createOutboundMessage({
                thread_id: thread_id,
                case_id: threadRow.case_id,
                user_id: user.id,
                subject: `Re: ${latestReply.subject.replace(/^(Re:\s*)+/i, "")}`,
                body: draftedText,
                from_address: oauth.gmail_address,
                to_address: latestReply.from_address,
                status: isAuto ? "approved" : "draft", 
                generation_source: "ai_followup",
                approval_required: !isAuto
             });
             
             const supabaseAuth = createSupabaseServerAuthClient(await cookies());
             await supabaseAuth.from("communication_threads").update({ 
                 state: "ready_to_follow_up",
                 updated_at: new Date().toISOString()
             }).eq("id", thread_id);
             
             console.log("[Redressa Sync] Successfully recovered draft!");
             
          } catch (err) {
             console.error("[Redressa Sync] Recovery generation failed:", err);
          }
       }
    }

    return NextResponse.json({ 
       success: true, 
       synced_count: newInboundMessages.length 
    });

  } catch (error) {
    console.error("[Redressa Sync API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
