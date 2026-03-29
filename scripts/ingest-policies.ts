/**
 * Policy Ingestion Script
 *
 * Reads markdown policy files from data/policies/raw/,
 * parses them into documents + chunks, and inserts into Supabase.
 *
 * Usage:
 *   npx tsx scripts/ingest-policies.ts
 *
 * Each markdown file must have YAML frontmatter with:
 *   title, source_type, category, company_name, source_url, last_updated
 *
 * The script:
 * 1. Reads all .md files from data/policies/raw/
 * 2. Parses YAML frontmatter for document metadata
 * 3. Splits the body into chunks by ## headings
 * 4. Extracts keywords from each chunk
 * 5. Upserts into policy_documents and policy_chunks tables
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// ---- Config ----

const RAW_DIR = path.resolve(__dirname, "../data/policies/raw");

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing env var: ${key}. Set it in .env.local`);
  }
  return val;
}

// ---- Frontmatter Parser ----

interface PolicyMeta {
  title: string;
  source_type: "company_policy" | "regulation";
  category: "aviation" | "ecommerce";
  company_name: string | null;
  source_url: string | null;
  last_updated: string;
}

function parseFrontmatter(content: string): { meta: PolicyMeta; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("No YAML frontmatter found. Expected ---\\n...\\n---");
  }

  const yamlBlock = match[1];
  const body = match[2].trim();

  // Simple YAML parser (no dependency needed for flat key-value)
  const meta: Record<string, string> = {};
  for (const line of yamlBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Strip quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }

  return {
    meta: {
      title: meta.title || "Untitled",
      source_type: (meta.source_type as PolicyMeta["source_type"]) || "company_policy",
      category: (meta.category as PolicyMeta["category"]) || "aviation",
      company_name: meta.company_name === "null" ? null : meta.company_name || null,
      source_url: meta.source_url === "null" ? null : meta.source_url || null,
      last_updated: meta.last_updated || new Date().toISOString(),
    },
    body,
  };
}

// ---- Chunking ----

interface Chunk {
  section_label: string;
  content: string;
  chunk_index: number;
  keywords: string[];
}

/**
 * Split markdown body into chunks at ## headings.
 * Each chunk includes the heading as section_label and everything until the next ## heading.
 * Sub-sections (### headings) are kept within their parent chunk.
 */
function chunkBySection(body: string): Chunk[] {
  const lines = body.split("\n");
  const chunks: Chunk[] = [];

  let currentLabel = "Introduction";
  let currentLines: string[] = [];
  let chunkIndex = 0;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      // Save previous chunk if it has content
      if (currentLines.length > 0) {
        const content = currentLines.join("\n").trim();
        if (content.length > 0) {
          chunks.push({
            section_label: currentLabel,
            content,
            chunk_index: chunkIndex++,
            keywords: extractKeywords(content, currentLabel),
          });
        }
      }
      // Start new section
      currentLabel = line.replace(/^##\s+/, "").trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Don't forget the last chunk
  if (currentLines.length > 0) {
    const content = currentLines.join("\n").trim();
    if (content.length > 0) {
      chunks.push({
        section_label: currentLabel,
        content,
        chunk_index: chunkIndex,
        keywords: extractKeywords(content, currentLabel),
      });
    }
  }

  return chunks;
}

/**
 * Extract simple keywords from chunk content.
 * Uses a curated keyword list relevant to consumer complaints.
 * No NLP dependency needed — this is deterministic and fast.
 */
function extractKeywords(content: string, sectionLabel: string): string[] {
  const text = `${sectionLabel} ${content}`.toLowerCase();
  const keywords: string[] = [];

  const KEYWORD_MAP: Record<string, string[]> = {
    // Aviation
    cancellation: ["cancel", "cancellation", "cancelled"],
    refund: ["refund", "reimbursement", "money back"],
    delay: ["delay", "delayed", "late", "tarmac"],
    compensation: ["compensation", "compensate", "INR", "amount"],
    denied_boarding: ["denied boarding", "overbooking", "overbooked"],
    baggage: ["baggage", "luggage", "lost baggage", "damaged baggage"],
    // E-commerce
    damaged: ["damaged", "damage", "broken", "dented", "cracked"],
    defective: ["defective", "defect", "not working", "malfunction", "manufacturing"],
    wrong_item: ["wrong item", "wrong product", "incorrect"],
    missing: ["missing", "not received", "lost"],
    return: ["return", "replacement", "exchange"],
    // Common
    timeline: ["days", "hours", "within", "timeline", "deadline", "window"],
    escalation: ["escalation", "escalate", "grievance", "nodal", "consumer forum", "ombudsman", "complaint"],
    contact: ["email", "call", "phone", "helpline", "portal", "website"],
    warranty: ["warranty", "guarantee"],
  };

  for (const [keyword, patterns] of Object.entries(KEYWORD_MAP)) {
    if (patterns.some((p) => text.includes(p))) {
      keywords.push(keyword);
    }
  }

  return keywords;
}

// ---- Main ----

async function main() {
  console.log("=== Redressa AI - Policy Ingestion ===\n");

  // Load env from .env.local
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx);
      const value = trimmed.slice(eqIdx + 1);
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceKey);

  // Read all markdown files from raw directory
  const files = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".md"));
  console.log(`Found ${files.length} policy file(s) in ${RAW_DIR}\n`);

  if (files.length === 0) {
    console.log("No .md files found. Add policy files to data/policies/raw/");
    return;
  }

  for (const filename of files) {
    const filepath = path.join(RAW_DIR, filename);
    const raw = fs.readFileSync(filepath, "utf-8");

    console.log(`Processing: ${filename}`);

    // Parse frontmatter
    const { meta, body } = parseFrontmatter(raw);
    console.log(`  Title: ${meta.title}`);
    console.log(`  Type: ${meta.source_type} | Category: ${meta.category}`);

    // Chunk the body
    const chunks = chunkBySection(body);
    console.log(`  Chunks: ${chunks.length}`);

    // Delete existing document with same title (idempotent re-run)
    const { data: existing } = await supabase
      .from("policy_documents")
      .select("id")
      .eq("title", meta.title)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  Replacing existing document (id: ${existing[0].id})`);
      await supabase.from("policy_documents").delete().eq("id", existing[0].id);
    }

    // Insert document
    const { data: doc, error: docError } = await supabase
      .from("policy_documents")
      .insert({
        title: meta.title,
        source_type: meta.source_type,
        company_name: meta.company_name,
        category: meta.category,
        source_url: meta.source_url,
        last_updated: meta.last_updated,
      })
      .select()
      .single();

    if (docError) {
      console.error(`  ERROR inserting document: ${docError.message}`);
      continue;
    }

    console.log(`  Document ID: ${doc.id}`);

    // Insert chunks
    const chunkInserts = chunks.map((c) => ({
      document_id: doc.id,
      section_label: c.section_label,
      content: c.content,
      chunk_index: c.chunk_index,
      keywords: c.keywords,
    }));

    const { error: chunkError } = await supabase
      .from("policy_chunks")
      .insert(chunkInserts);

    if (chunkError) {
      console.error(`  ERROR inserting chunks: ${chunkError.message}`);
      continue;
    }

    console.log(`  ✅ Inserted ${chunks.length} chunks`);
    console.log(`  Keywords: ${[...new Set(chunks.flatMap((c) => c.keywords))].join(", ")}`);
    console.log();
  }

  console.log("=== Ingestion complete ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
