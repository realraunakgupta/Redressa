import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { getOAuthAccount, updateMessageStatus, updateThreadState } from "@/lib/supabase/helpers-communication";
import { addCaseEvent } from "@/lib/supabase/helpers";

export const maxDuration = 60; // Allow sufficient time for multiple API calls

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the Cron request
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // Fail fully closed in production if secret is not configured at all
    if (process.env.NODE_ENV === "production" && !cronSecret) {
        return NextResponse.json({ error: "Server misconfiguration: CRON_SECRET is required in production." }, { status: 500 });
    }

    const expectedHeader = `Bearer ${cronSecret || "hackathon_default_secret_123"}`;

    if (authHeader !== expectedHeader) {
      // In production, strictly enforce auth
      if (process.env.NODE_ENV === "production" || authHeader !== null) {
          return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
      }
    }

    const supabase = createServerSupabaseClient();
    
    // 2. Fetch all messages that are 'approved' and ready to send
    const { data: approvedMessages, error: queryError } = await supabase
      .from("outbound_messages")
      .select("*")
      .eq("status", "approved");

    if (queryError) {
      throw new Error(`Failed to query approved messages: ${queryError.message}`);
    }

    if (!approvedMessages || approvedMessages.length === 0) {
      return NextResponse.json({ success: true, dispatched_count: 0, message: "No approved messages pending dispatch." });
    }

    let dispatchedCount = 0;
    const errors = [];

    // 3. Process each approved message
    for (const message of approvedMessages) {
      try {
        // Mark as sending to prevent duplicate processing
        await updateMessageStatus(message.id, "sending");

        // Fetch user's OAuth credentials bypassing RLS
        const oauth = await getOAuthAccount(message.user_id);
        if (!oauth || !oauth.access_token) {
          throw new Error("User has no connected Gmail account.");
        }

        let accessToken = oauth.access_token;
        
        // Handle Token Refresh logic
        if (new Date(oauth.token_expires_at) < new Date()) {
           console.log(`[Redressa Cron] Token expired for user ${message.user_id}, refreshing...`);
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
               throw new Error("Gmail session expired and refresh failed.");
           }
           
           const refreshData = await refreshResp.json();
           accessToken = refreshData.access_token;
           // Intentionally skipping db oauth_accounts update for hackathon simplicity
        }

        // Construct raw MIME message
        const emailData = [
          `To: ${message.to_address}`,
          `Subject: ${message.subject}`,
          `From: ${oauth.gmail_address}`,
          "Content-Type: text/plain; charset=utf-8",
          "",
          message.body
        ].join("\r\n");

        const encodedEmail = Buffer.from(emailData).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        // Dispatch via Gmail API
        console.log(`[Redressa Cron] Dispatching message ${message.id} via Gmail...`);
        const sendResp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ raw: encodedEmail })
        });

        if (!sendResp.ok) {
           const apiError = await sendResp.text();
           throw new Error(`Gmail API rejected dispatch: ${apiError}`);
        }

        const sendResult = await sendResp.json();

        // Update successful dispatch state
        await updateMessageStatus(message.id, "sent", {
           gmail_message_id: sendResult.id,
           sent_at: new Date().toISOString(),
           approved_by: "system_autopilot",
           approved_at: new Date().toISOString()
        });

        await updateThreadState(message.thread_id, "sent", sendResult.threadId);

        await addCaseEvent({
            case_id: message.case_id,
            event_type: "autopilot_dispatched",
            title: "Autopilot Message Dispatched",
            detail: "The background worker successfully sent the Autopilot draft to the merchant.",
            metadata: { messageId: sendResult.id, threadId: sendResult.threadId }
        });

        dispatchedCount++;
        console.log(`[Redressa Cron] Successfully dispatched message ${message.id}`);

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error(`[Redressa Cron] Failed to dispatch message ${message.id}:`, err);
        await updateMessageStatus(message.id, "failed");
        errors.push({ id: message.id, error: errorMessage });
      }
    }

    return NextResponse.json({ 
       success: true, 
       dispatched_count: dispatchedCount, 
       errors_count: errors.length,
       errors 
    });

  } catch (error) {
    console.error("[Redressa Cron API] Fatal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
