/**
 * Policy Retrieval Module
 *
 * Deterministic, keyword-based retrieval of policy/regulation chunks.
 * No vector search — uses keyword matching against the keywords[] column.
 *
 * Returns results with proper citation structure for downstream use.
 */

import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { Citation } from "@/lib/types";

// ---- Types ----

export interface RetrievedChunk {
  document_id: string;
  document_title: string;
  source_type: "company_policy" | "regulation";
  company_name: string | null;
  section_label: string;
  content: string;
  chunk_index: number;
  keywords: string[];
  relevance_score: number;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  citations: Citation[];
}

interface RetrievedPolicyRow {
  document_id: string;
  section_label: string;
  content: string;
  chunk_index: number;
  keywords: string[] | null;
  document: {
    id: string;
    title: string;
    source_type: "company_policy" | "regulation";
    company_name: string | null;
    category: "aviation" | "ecommerce";
  } | null;
}

// ---- Keyword Extraction ----

/**
 * Extract search keywords from a complaint description.
 * Maps complaint text to the same keyword vocabulary used during ingestion.
 */
export function extractSearchKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const keywords: string[] = [];

  const SEARCH_PATTERNS: Record<string, string[]> = {
    cancellation: ["cancel", "cancelled", "cancellation"],
    refund: ["refund", "money back", "reimbursement", "not refunded"],
    delay: ["delay", "delayed", "late", "hours late", "tarmac"],
    compensation: ["compensation", "compensate"],
    denied_boarding: ["denied boarding", "overbooking", "overbooked", "bumped"],
    baggage: ["baggage", "luggage", "bag lost", "bag damaged"],
    damaged: ["damaged", "broken", "dented", "cracked", "crushed"],
    defective: ["defective", "defect", "not working", "malfunction", "dead on arrival", "doa"],
    wrong_item: ["wrong item", "wrong product", "received different", "incorrect item"],
    missing: ["missing item", "not received", "lost in transit", "never delivered"],
    return: ["return", "replacement", "exchange", "replace"],
    timeline: ["how long", "days", "deadline", "time limit", "within"],
    escalation: ["escalate", "grievance", "complaint", "nodal", "consumer forum", "not resolved"],
    contact: ["contact", "email", "phone", "helpline", "call"],
    warranty: ["warranty", "guarantee", "under warranty"],
  };

  for (const [keyword, patterns] of Object.entries(SEARCH_PATTERNS)) {
    if (patterns.some((p) => lower.includes(p))) {
      keywords.push(keyword);
    }
  }

  return keywords;
}

// ---- Retrieval ----

/**
 * Retrieve relevant policy chunks for a complaint.
 *
 * Strategy:
 * 1. Extract keywords from the complaint text
 * 2. Query policy_chunks where category matches and keywords overlap
 * 3. Score by keyword overlap count
 * 4. Return top-N results with citation formatting
 */
export async function retrievePolicyChunks(options: {
  category: "aviation" | "ecommerce";
  complaintText: string;
  maxResults?: number;
  sourceType?: "company_policy" | "regulation";
}): Promise<RetrievalResult> {
  const { category, complaintText, maxResults = 10, sourceType } = options;
  const searchKeywords = extractSearchKeywords(complaintText);

  if (searchKeywords.length === 0) {
    return { chunks: [], citations: [] };
  }

  const supabase = createServerSupabaseClient();

  // Fetch all chunks for this category (with document info)
  // For Phase 1, the corpus is small enough to fetch all and filter in-memory
  const query = supabase
    .from("policy_chunks")
    .select(`
      *,
      document:policy_documents!inner(id, title, source_type, company_name, category)
    `)
    .eq("document.category", category);

  const { data, error } = await query.order("chunk_index", { ascending: true });

  if (error) {
    throw new Error(`[Redressa] Policy retrieval failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return { chunks: [], citations: [] };
  }

  // Score each chunk by keyword overlap
  const scored: RetrievedChunk[] = [];
  for (const row of data as RetrievedPolicyRow[]) {
    const chunkKeywords = row.keywords ?? [];
    const overlap = searchKeywords.filter((k) => chunkKeywords.includes(k));

    if (overlap.length === 0) continue;

    // Filter by source_type if specified
    if (sourceType && row.document?.source_type !== sourceType) continue;

    scored.push({
      document_id: row.document?.id ?? row.document_id,
      document_title: row.document?.title ?? "Unknown",
      source_type: row.document?.source_type ?? "company_policy",
      company_name: row.document?.company_name ?? null,
      section_label: row.section_label,
      content: row.content,
      chunk_index: row.chunk_index,
      keywords: chunkKeywords,
      relevance_score: overlap.length,
    });
  }

  // Sort by relevance score (desc), then chunk_index (asc) for stability
  scored.sort((a, b) => {
    if (b.relevance_score !== a.relevance_score) {
      return b.relevance_score - a.relevance_score;
    }
    return a.chunk_index - b.chunk_index;
  });

  // Take top-N
  const topChunks = scored.slice(0, maxResults);

  // Format citations
  const citations: Citation[] = topChunks.map((chunk) => ({
    source_title: chunk.document_title,
    section_label: chunk.section_label,
    excerpt: truncateExcerpt(chunk.content, 300),
    source_type: chunk.source_type === "regulation" ? "regulation" : "policy",
  }));

  return { chunks: topChunks, citations };
}

/**
 * Retrieve chunks for both policy AND regulation in one call.
 * Useful for the evaluation step which needs to compare both.
 */
export async function retrieveAllRelevant(options: {
  category: "aviation" | "ecommerce";
  complaintText: string;
  maxPerType?: number;
}): Promise<{ policy: RetrievalResult; regulation: RetrievalResult }> {
  const { category, complaintText, maxPerType = 5 } = options;

  const [policy, regulation] = await Promise.all([
    retrievePolicyChunks({
      category,
      complaintText,
      maxResults: maxPerType,
      sourceType: "company_policy",
    }),
    retrievePolicyChunks({
      category,
      complaintText,
      maxResults: maxPerType,
      sourceType: "regulation",
    }),
  ]);

  return { policy, regulation };
}

// ---- Helpers ----

function truncateExcerpt(text: string, maxLength: number): string {
  // Take the first meaningful paragraph
  const lines = text.split("\n").filter((l) => l.trim().length > 0 && !l.startsWith("#"));
  const joined = lines.join(" ").replace(/\s+/g, " ").trim();

  if (joined.length <= maxLength) return joined;
  return joined.slice(0, maxLength - 3) + "...";
}
