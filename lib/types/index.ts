/**
 * Redressa AI - Core Type Definitions
 *
 * These types define the shape of data flowing through the pipeline.
 * They will be expanded as the backend schema is built out.
 */

// ---- Complaint Categories ----

export type ComplaintCategory = "aviation" | "ecommerce";

export type ComplaintSubcategory =
  | "flight_cancellation"
  | "flight_delay"
  | "refund_dispute"
  | "damaged_item"
  | "defective_item"
  | "wrong_item"
  | "delayed_delivery";

// ---- Case ----

export type CaseStatus =
  | "intake"
  | "processing"
  | "evaluated"
  | "complete"
  | "error";

export interface Case {
  id: string;
  created_at: string;
  updated_at: string;
  status: CaseStatus;
  category: ComplaintCategory | null;
  subcategory: ComplaintSubcategory | null;
  description: string;
  merchant_name: string | null;
  order_reference: string | null;
  amount: number | null;
  currency: string;
}

// ---- Case Files (uploaded evidence) ----

export type FileType = "pdf" | "image" | "text" | "email" | "screenshot";

export interface CaseFile {
  id: string;
  case_id: string;
  file_name: string;
  file_type: FileType;
  file_url: string;
  parsed_text: string | null;
  created_at: string;
}

// ---- Case Events (Agent Activity) ----

export type EventType =
  | "intake_received"
  | "parsing_started"
  | "parsing_complete"
  | "extraction_complete"
  | "timeline_assembled"
  | "classification_complete"
  | "policy_retrieved"
  | "regulation_retrieved"
  | "evaluation_complete"
  | "route_recommended"
  | "outputs_generated"
  | "error";

export interface CaseEvent {
  id: string;
  case_id: string;
  event_type: EventType;
  title: string;
  detail: string | null;
  created_at: string;
}

// ---- Generated Outputs ----

export type OutputType =
  | "case_summary"
  | "grievance_email"
  | "escalation_note"
  | "evidence_checklist"
  | "evidence_pack_preview";

export interface GeneratedOutput {
  id: string;
  case_id: string;
  output_type: OutputType;
  title: string;
  content: string;
  citations: Citation[];
  created_at: string;
}

// ---- Citations ----

export interface Citation {
  source_title: string;
  section_label: string;
  excerpt: string;
  source_type: "policy" | "regulation";
}

// ---- Policy Documents ----

export interface PolicyDocument {
  id: string;
  title: string;
  source_type: "company_policy" | "regulation";
  company_name: string | null;
  category: ComplaintCategory;
  source_url: string | null;
  last_updated: string;
}

export interface PolicyChunk {
  id: string;
  document_id: string;
  section_label: string;
  content: string;
  chunk_index: number;
}

// ---- Escalation Route ----

export type EscalationTarget =
  | "grievance_cell"
  | "nodal_officer"
  | "regulator"
  | "consumer_forum"
  | "ombudsman";

export interface EscalationRoute {
  target: EscalationTarget;
  target_name: string;
  contact_info: string | null;
  rationale: string;
  priority: number;
}
