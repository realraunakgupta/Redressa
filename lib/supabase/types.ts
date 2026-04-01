/**
 * Supabase Database Types
 *
 * Generated manually to match supabase/schema.sql.
 * Provides type safety for all Supabase client operations.
 *
 * Usage:
 *   const { data } = await supabase.from("cases").select("*");
 *   // data is typed as Database["public"]["Tables"]["cases"]["Row"][]
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          status: "intake" | "processing" | "evaluated" | "complete" | "error";
          category: "aviation" | "ecommerce" | null;
          subcategory: string | null;
          description: string;
          merchant_name: string | null;
          order_reference: string | null;
          amount: number | null;
          currency: string;
          is_demo: boolean;
          user_id: string | null;
          consumer_name: string | null;
          consumer_email: string | null;
          consumer_phone: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: "intake" | "processing" | "evaluated" | "complete" | "error";
          category?: "aviation" | "ecommerce" | null;
          subcategory?: string | null;
          description?: string;
          merchant_name?: string | null;
          order_reference?: string | null;
          amount?: number | null;
          currency?: string;
          is_demo?: boolean;
          user_id?: string | null;
          consumer_name?: string | null;
          consumer_email?: string | null;
          consumer_phone?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          status?: "intake" | "processing" | "evaluated" | "complete" | "error";
          category?: "aviation" | "ecommerce" | null;
          subcategory?: string | null;
          description?: string;
          merchant_name?: string | null;
          order_reference?: string | null;
          amount?: number | null;
          currency?: string;
          is_demo?: boolean;
          user_id?: string | null;
          consumer_name?: string | null;
          consumer_email?: string | null;
          consumer_phone?: string | null;
        };
      };
      case_files: {
        Row: {
          id: string;
          case_id: string;
          file_name: string;
          file_type: "pdf" | "image" | "text" | "email" | "screenshot";
          storage_path: string;
          file_url: string | null;
          mime_type: string | null;
          file_size: number | null;
          parsed_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          file_name: string;
          file_type?: "pdf" | "image" | "text" | "email" | "screenshot";
          storage_path: string;
          file_url?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          parsed_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          file_name?: string;
          file_type?: "pdf" | "image" | "text" | "email" | "screenshot";
          storage_path?: string;
          file_url?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          parsed_text?: string | null;
          created_at?: string;
        };
      };
      case_events: {
        Row: {
          id: string;
          case_id: string;
          event_type: string;
          title: string;
          detail: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          event_type: string;
          title: string;
          detail?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          event_type?: string;
          title?: string;
          detail?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      policy_documents: {
        Row: {
          id: string;
          title: string;
          source_type: "company_policy" | "regulation";
          company_name: string | null;
          category: "aviation" | "ecommerce";
          source_url: string | null;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          source_type: "company_policy" | "regulation";
          company_name?: string | null;
          category: "aviation" | "ecommerce";
          source_url?: string | null;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          source_type?: "company_policy" | "regulation";
          company_name?: string | null;
          category?: "aviation" | "ecommerce";
          source_url?: string | null;
          last_updated?: string;
          created_at?: string;
        };
      };
      policy_chunks: {
        Row: {
          id: string;
          document_id: string;
          section_label: string;
          content: string;
          chunk_index: number;
          keywords: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          section_label: string;
          content: string;
          chunk_index?: number;
          keywords?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          section_label?: string;
          content?: string;
          chunk_index?: number;
          keywords?: string[];
          created_at?: string;
        };
      };
      generated_outputs: {
        Row: {
          id: string;
          case_id: string;
          output_type:
            | "case_summary"
            | "grievance_email"
            | "escalation_note"
            | "evidence_checklist"
            | "evidence_pack_preview";
          title: string;
          content: string;
          citations: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          output_type:
            | "case_summary"
            | "grievance_email"
            | "escalation_note"
            | "evidence_checklist"
            | "evidence_pack_preview";
          title: string;
          content?: string;
          citations?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          output_type?:
            | "case_summary"
            | "grievance_email"
            | "escalation_note"
            | "evidence_checklist"
            | "evidence_pack_preview";
          title?: string;
          content?: string;
          citations?: Json;
          created_at?: string;
        };
      };
      inbound_messages: {
        Row: {
          id: string;
          thread_id: string;
          case_id: string;
          user_id: string;
          gmail_message_id: string;
          subject: string;
          body: string;
          from_address: string;
          to_address: string;
          classification_category: "resolved" | "partial_resolution" | "stalling" | "asking_for_info" | "rejecting_liability" | "escalating_internally" | "unclear" | null;
          classification_reason: string | null;
          parent_message_id: string | null;
          received_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          case_id: string;
          user_id: string;
          gmail_message_id: string;
          subject: string;
          body: string;
          from_address: string;
          to_address: string;
          classification_category?: "resolved" | "partial_resolution" | "stalling" | "asking_for_info" | "rejecting_liability" | "escalating_internally" | "unclear" | null;
          classification_reason?: string | null;
          parent_message_id?: string | null;
          received_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          case_id?: string;
          user_id?: string;
          gmail_message_id?: string;
          subject?: string;
          body?: string;
          from_address?: string;
          to_address?: string;
          classification_category?: "resolved" | "partial_resolution" | "stalling" | "asking_for_info" | "rejecting_liability" | "escalating_internally" | "unclear" | null;
          classification_reason?: string | null;
          parent_message_id?: string | null;
          received_at?: string;
          created_at?: string;
        };
      };
      oauth_accounts: {
        Row: {
          id: string;
          user_id: string;
          provider: "google";
          gmail_address: string;
          access_token: string;
          refresh_token: string;
          token_expires_at: string;
          scopes: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider?: "google";
          gmail_address: string;
          access_token: string;
          refresh_token: string;
          token_expires_at: string;
          scopes?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: "google";
          gmail_address?: string;
          access_token?: string;
          refresh_token?: string;
          token_expires_at?: string;
          scopes?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      communication_threads: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          escalation_target: string;
          target_email: string;
          target_name: string;
          channel: "email";
          state: "draft"|"ready_to_send"|"sent"|"awaiting_reply"|"reply_received"|"needs_user_input"|"ready_to_follow_up"|"paused"|"escalated"|"resolved"|"closed";
          gmail_thread_id: string | null;
          automation_mode: "manual"|"assisted"|"autopilot";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          user_id: string;
          escalation_target: string;
          target_email: string;
          target_name: string;
          channel?: "email";
          state?: "draft"|"ready_to_send"|"sent"|"awaiting_reply"|"reply_received"|"needs_user_input"|"ready_to_follow_up"|"paused"|"escalated"|"resolved"|"closed";
          gmail_thread_id?: string | null;
          automation_mode?: "manual"|"assisted"|"autopilot";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          user_id?: string;
          escalation_target?: string;
          target_email?: string;
          target_name?: string;
          channel?: "email";
          state?: "draft"|"ready_to_send"|"sent"|"awaiting_reply"|"reply_received"|"needs_user_input"|"ready_to_follow_up"|"paused"|"escalated"|"resolved"|"closed";
          gmail_thread_id?: string | null;
          automation_mode?: "manual"|"assisted"|"autopilot";
          created_at?: string;
          updated_at?: string;
        };
      };
      outbound_messages: {
        Row: {
          id: string;
          thread_id: string;
          case_id: string;
          user_id: string;
          subject: string;
          body: string;
          from_address: string;
          to_address: string;
          status: "draft"|"approved"|"sending"|"sent"|"failed";
          gmail_message_id: string | null;
          sent_at: string | null;
          approval_required: boolean;
          approved_at: string | null;
          approved_by: string | null;
          generation_source: "pipeline"|"user_edit"|"ai_followup";
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          case_id: string;
          user_id: string;
          subject: string;
          body: string;
          from_address: string;
          to_address: string;
          status?: "draft"|"approved"|"sending"|"sent"|"failed";
          gmail_message_id?: string | null;
          sent_at?: string | null;
          approval_required?: boolean;
          approved_at?: string | null;
          approved_by?: string | null;
          generation_source?: "pipeline"|"user_edit"|"ai_followup";
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          case_id?: string;
          user_id?: string;
          subject?: string;
          body?: string;
          from_address?: string;
          to_address?: string;
          status?: "draft"|"approved"|"sending"|"sent"|"failed";
          gmail_message_id?: string | null;
          sent_at?: string | null;
          approval_required?: boolean;
          approved_at?: string | null;
          approved_by?: string | null;
          generation_source?: "pipeline"|"user_edit"|"ai_followup";
          created_at?: string;
        };
      };
      approval_events: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          action: "approved"|"rejected"|"edited_and_approved";
          edited_body: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          action: "approved"|"rejected"|"edited_and_approved";
          edited_body?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          user_id?: string;
          action?: "approved"|"rejected"|"edited_and_approved";
          edited_body?: string | null;
          reason?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// ---- Convenience row types ----

export type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
export type CaseInsert = Database["public"]["Tables"]["cases"]["Insert"];
export type CaseFileRow = Database["public"]["Tables"]["case_files"]["Row"];
export type CaseEventRow = Database["public"]["Tables"]["case_events"]["Row"];
export type PolicyDocRow = Database["public"]["Tables"]["policy_documents"]["Row"];
export type PolicyChunkRow = Database["public"]["Tables"]["policy_chunks"]["Row"];
export type GeneratedOutputRow = Database["public"]["Tables"]["generated_outputs"]["Row"];

export type OAuthAccountRow = Database["public"]["Tables"]["oauth_accounts"]["Row"];
export type CommunicationThreadRow = Database["public"]["Tables"]["communication_threads"]["Row"];
export type OutboundMessageRow = Database["public"]["Tables"]["outbound_messages"]["Row"];
export type InboundMessageRow = Database["public"]["Tables"]["inbound_messages"]["Row"];
export type ApprovalEventRow = Database["public"]["Tables"]["approval_events"]["Row"];
