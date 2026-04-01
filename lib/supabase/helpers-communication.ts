/**
 * Supabase Database Helpers: Communication
 *
 * Typed convenience functions for Thread, Message, and OAuth operations.
 * These use the server client (service role key) allowing the backend
 * to fetch and manipulate tokens/threads safely while enforcing business logic.
 */

import { createServerSupabaseClient } from "./client";
import type {
  CommunicationThreadRow,
  OutboundMessageRow,
  OAuthAccountRow,
  InboundMessageRow,
} from "./types";
import type { Database } from "./types";

// ---- OAuth Accounts ----

export async function getOAuthAccount(userId: string): Promise<OAuthAccountRow | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("oauth_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`[Redressa] Failed to get OAuth account: ${error.message}`);
  }
  return (data as OAuthAccountRow) ?? null;
}

export async function upsertOAuthAccount(data: {
  user_id: string;
  gmail_address: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  scopes: string[];
}): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("oauth_accounts")
    .upsert({
      provider: "google",
      ...data,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" });

  if (error) throw new Error(`[Redressa] Failed to sync OAuth account: ${error.message}`);
}

// ---- Communication Threads ----

export async function createThread(data: {
  case_id: string;
  user_id: string;
  escalation_target: string;
  target_email: string;
  target_name: string;
}): Promise<CommunicationThreadRow> {
  const supabase = createServerSupabaseClient();
  const { data: row, error } = await supabase
    .from("communication_threads")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`[Redressa] Failed to create thread: ${error.message}`);
  return row as CommunicationThreadRow;
}

export async function getThreadsForCase(caseId: string): Promise<CommunicationThreadRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("communication_threads")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`[Redressa] Failed to get threads: ${error.message}`);
  return (data as CommunicationThreadRow[]) ?? [];
}

export async function updateThreadState(
  id: string,
  state: CommunicationThreadRow["state"],
  gmailThreadId?: string
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const updatePayload: Record<string, unknown> = { state, updated_at: new Date().toISOString() };
  if (gmailThreadId) updatePayload.gmail_thread_id = gmailThreadId;

  const { error } = await supabase
    .from("communication_threads")
    .update(updatePayload)
    .eq("id", id);

  if (error) throw new Error(`[Redressa] Failed to update thread: ${error.message}`);
}

// ---- Outbound Messages ----

export async function createOutboundMessage(data: {
  thread_id: string;
  case_id: string;
  user_id: string;
  subject: string;
  body: string;
  from_address: string;
  to_address: string;
  status?: "draft" | "approved" | "sending" | "sent" | "failed";
  generation_source?: "pipeline" | "user_edit" | "ai_followup";
  approval_required?: boolean;
}): Promise<OutboundMessageRow> {
  const supabase = createServerSupabaseClient();
  const { data: row, error } = await supabase
    .from("outbound_messages")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`[Redressa] Failed to create message: ${error.message}`);
  return row as OutboundMessageRow;
}

export async function getMessagesForThread(threadId: string): Promise<OutboundMessageRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("outbound_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`[Redressa] Failed to get messages: ${error.message}`);
  return (data as OutboundMessageRow[]) ?? [];
}

export async function updateMessageStatus(
  id: string,
  status: OutboundMessageRow["status"],
  updates?: { gmail_message_id?: string; to_address?: string; subject?: string; body?: string; sent_at?: string; approved_by?: string; approved_at?: string }
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("outbound_messages")
    .update({ status, ...updates })
    .eq("id", id);

  if (error) throw new Error(`[Redressa] Failed to update message: ${error.message}`);
}

// ---- Inbound Messages ----

export async function createInboundMessage(
  data: Database["public"]["Tables"]["inbound_messages"]["Insert"]
): Promise<InboundMessageRow> {
  const supabase = createServerSupabaseClient();
  const { data: row, error } = await supabase
    .from("inbound_messages")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`[Redressa] Failed to create inbound message: ${error.message}`);
  return row as InboundMessageRow;
}

export async function getInboundMessages(threadId: string): Promise<InboundMessageRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("inbound_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("received_at", { ascending: true });

  if (error) throw new Error(`[Redressa] Failed to get inbound messages: ${error.message}`);
  return (data as InboundMessageRow[]) ?? [];
}
