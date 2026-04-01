import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { getOAuthAccount, getMessagesForThread, updateMessageStatus, updateThreadState } from "@/lib/supabase/helpers-communication";
import { addCaseEvent } from "@/lib/supabase/helpers";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createSupabaseServerAuthClient(cookieStore);
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bodyPayload = await request.json().catch(() => ({}));
    const { message_id, thread_id, to_address: toAddressOverride, subject, body } = bodyPayload;

    if (!message_id || !thread_id) {
      return NextResponse.json({ error: "message_id and thread_id are required" }, { status: 400 });
    }

    // Safety constraints for overrides
    const validateOverride = (val: unknown, limit?: number) => {
       if (typeof val !== "string") return null;
       const trimmed = val.trim();
       if (!trimmed) return null;
       return limit ? trimmed.substring(0, limit) : trimmed;
    };

    const subjectOverride = validateOverride(subject, 200);
    const bodyOverride = validateOverride(body);

    // 1. Get the message to send
    const messages = await getMessagesForThread(thread_id);
    const message = messages.find(m => m.id === message_id);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // A message MUST be explicitly un-sent to proceed (either draft, approved, or from a previous failure)
    if (message.status !== "draft" && message.status !== "failed" && message.status !== "approved") {
      return NextResponse.json({ error: `Message is already in status: ${message.status}` }, { status: 400 });
    }
    
    // Ensure the message belongs to the user
    if (message.user_id !== user.id) {
       return NextResponse.json({ error: "Unauthorized action on message" }, { status: 403 });
    }

    // 2. Refresh or get OAuth Gmail Token
    const oauth = await getOAuthAccount(user.id);
    if (!oauth || !oauth.access_token) {
      return NextResponse.json({ error: "Gmail not connected", code: "GMAIL_NOT_CONNECTED" }, { status: 403 });
    }

    let accessToken = oauth.access_token;
    
    // Check if token is expired, if so, we'd need to refresh it via Google's OAuth2 endpoint.
    // For now, we assume it's valid or try to use it. If it fails due to 401, we should refresh.
    if (new Date(oauth.token_expires_at) < new Date()) {
       console.log("[Redressa] Token expired, attempting refresh...");
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
           return NextResponse.json({ error: "Gmail session expired. Re-authorizing...", code: "GMAIL_NOT_CONNECTED" }, { status: 403 });
       }
       
       const refreshData = await refreshResp.json();
       accessToken = refreshData.access_token;
       // We should technically update oauth_accounts here but omitting for brevity/hackathon
    }

    // 3. Construct raw MIME message
    const finalToAddress = toAddressOverride ? validateOverride(toAddressOverride, 200) || message.to_address : message.to_address;
    const finalSubject = subjectOverride || message.subject;
    const finalBodyText = bodyOverride || message.body;
    
    const emailData = [
      `To: ${finalToAddress}`,
      `Subject: ${finalSubject}`,
      `From: ${oauth.gmail_address}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      finalBodyText
    ].join("\r\n");

    const encodedEmail = Buffer.from(emailData).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // 4. Send via Gmail API
    const sendResp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
         raw: encodedEmail
      })
    });

    if (!sendResp.ok) {
      let errorMessage = "Failed to send email via Gmail API";
      try {
        const errorData = await sendResp.json();
        const apiError = errorData?.error?.message;
        if (apiError) errorMessage += `: ${apiError}`;
        if (apiError?.includes("Insufficient Permission") || apiError?.includes("Scope")) {
          errorMessage = "Gmail Permission Denied: Ensure you have added your email to the Google Cloud 'Test Users' list or verified your app.";
        }
      } catch {
        // Fallback to text if JSON parsing fails
      }
      await updateMessageStatus(message.id, "failed");
      console.error("[Redressa] Gmail API Error:", errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 502 });
    }

    const sendResult = await sendResp.json();

    // 5. Update DB State
    await updateMessageStatus(message.id, "sent", {
       gmail_message_id: sendResult.id,
       to_address: finalToAddress,
       subject: finalSubject, // save exactly what was sent
       body: finalBodyText,   // save exactly what was sent
       sent_at: new Date().toISOString(),
       approved_by: user.id, // we consider clicking send as approval
       approved_at: new Date().toISOString()
    });

    await updateThreadState(thread_id, "sent", sendResult.threadId);

    await addCaseEvent({
        case_id: message.case_id,
        event_type: "user_approved_send",
        title: "User Approved Send",
        detail: "User reviewed and dispatched the AI drafted message via their connected Gmail account.",
        metadata: { messageId: sendResult.id, threadId: sendResult.threadId }
    });

    return NextResponse.json({ success: true, messageId: sendResult.id });
  } catch (error) {
    console.error("[Redressa] Error in send API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
