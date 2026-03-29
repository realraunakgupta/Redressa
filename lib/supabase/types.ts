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
