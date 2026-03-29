/**
 * Supabase Database Helpers
 *
 * Typed convenience functions for common database operations.
 * All use the server client (service role key) unless noted.
 * These will be used by the pipeline and route handlers.
 *
 * Type safety is provided at the function boundary (params + return types)
 * rather than at the Supabase generic level.
 */

import { createServerSupabaseClient } from "./client";
import type {
  CaseRow,
  CaseInsert,
  CaseEventRow,
  CaseFileRow,
  GeneratedOutputRow,
  PolicyChunkRow,
  PolicyDocRow,
  Json,
} from "./types";

interface PolicyChunkWithDocument extends PolicyChunkRow {
  document: Pick<PolicyDocRow, "title" | "source_type" | "company_name"> & {
    category: PolicyDocRow["category"];
  };
}

// ---- Cases ----

export async function createCase(data: CaseInsert): Promise<CaseRow> {
  const supabase = createServerSupabaseClient();
  const { data: row, error } = await supabase
    .from("cases")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`[Redressa] Failed to create case: ${error.message}`);
  return row as CaseRow;
}

export async function getCase(id: string): Promise<CaseRow | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`[Redressa] Failed to get case: ${error.message}`);
  }
  return (data as CaseRow) ?? null;
}

export async function updateCaseStatus(
  id: string,
  status: CaseRow["status"]
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("cases")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(`[Redressa] Failed to update case status: ${error.message}`);
}

export async function listCases(options?: {
  demoOnly?: boolean;
  limit?: number;
}): Promise<CaseRow[]> {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.demoOnly) {
    query = query.eq("is_demo", true);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(`[Redressa] Failed to list cases: ${error.message}`);
  return (data as CaseRow[]) ?? [];
}

// ---- Case Files ----

export async function addCaseFile(data: {
  case_id: string;
  file_name: string;
  file_type: CaseFileRow["file_type"];
  storage_path: string;
  file_url?: string;
  mime_type?: string;
  file_size?: number;
}): Promise<CaseFileRow> {
  const supabase = createServerSupabaseClient();
  const { data: row, error } = await supabase
    .from("case_files")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`[Redressa] Failed to add case file: ${error.message}`);
  return row as CaseFileRow;
}

export async function getCaseFiles(caseId: string): Promise<CaseFileRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("case_files")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`[Redressa] Failed to get case files: ${error.message}`);
  return (data as CaseFileRow[]) ?? [];
}

// ---- Case Events ----

export async function addCaseEvent(data: {
  case_id: string;
  event_type: string;
  title: string;
  detail?: string;
  metadata?: Record<string, unknown>;
}): Promise<CaseEventRow> {
  const supabase = createServerSupabaseClient();
  const { data: row, error } = await supabase
    .from("case_events")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`[Redressa] Failed to add case event: ${error.message}`);
  return row as CaseEventRow;
}

export async function getCaseEvents(caseId: string): Promise<CaseEventRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("case_events")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`[Redressa] Failed to get case events: ${error.message}`);
  return (data as CaseEventRow[]) ?? [];
}

// ---- Policy Chunks ----

export async function getPolicyChunks(options: {
  category: "aviation" | "ecommerce";
  sourceType?: "company_policy" | "regulation";
}): Promise<PolicyChunkWithDocument[]> {
  const supabase = createServerSupabaseClient();

  // We query policy_chunks joined with policy_documents
  // Supabase PostgREST supports embedded joins via select syntax
  const { data, error } = await supabase
    .from("policy_chunks")
    .select(`
      *,
      document:policy_documents!inner(title, source_type, company_name, category)
    `)
    .eq("document.category", options.category)
    .order("chunk_index", { ascending: true });

  if (error) throw new Error(`[Redressa] Failed to get policy chunks: ${error.message}`);

  let results = (data ?? []) as PolicyChunkWithDocument[];

  // Filter by source_type in memory if needed (PostgREST embedded filters can be tricky)
  if (options.sourceType) {
    results = results.filter(
      (row) => row.document?.source_type === options.sourceType
    );
  }

  return results;
}

// ---- Generated Outputs ----

export async function addGeneratedOutput(data: {
  case_id: string;
  output_type: GeneratedOutputRow["output_type"];
  title: string;
  content: string;
  citations?: Json[];
}): Promise<GeneratedOutputRow> {
  const supabase = createServerSupabaseClient();
  const { data: row, error } = await supabase
    .from("generated_outputs")
    .insert({
      ...data,
      citations: data.citations ?? [],
    })
    .select()
    .single();

  if (error) throw new Error(`[Redressa] Failed to add generated output: ${error.message}`);
  return row as GeneratedOutputRow;
}

export async function getCaseOutputs(caseId: string): Promise<GeneratedOutputRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("generated_outputs")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`[Redressa] Failed to get case outputs: ${error.message}`);
  return (data as GeneratedOutputRow[]) ?? [];
}
