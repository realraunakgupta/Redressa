/**
 * Pipeline Step: Evidence Parsing
 *
 * Reads case files and extracts/stores parsed text.
 * For Phase 1 MVP, evidence is text-based (pasted descriptions, email text).
 * File-based parsing (PDF, images) is stubbed.
 */

import { getCaseFiles, addCaseEvent } from "@/lib/supabase/helpers";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { generateVision } from "@/lib/groq/client";

export interface ParsedEvidence {
  file_id: string;
  file_name: string;
  file_type: string;
  parsed_text: string;
}

export async function stepParsing(caseId: string): Promise<ParsedEvidence[]> {
  const files = await getCaseFiles(caseId);
  const parsed: ParsedEvidence[] = [];
  const supabase = createServerSupabaseClient();

  for (const file of files) {
    let text = file.parsed_text ?? "";
    const isImageFile =
      file.file_type === "image" ||
      file.file_type === "screenshot" ||
      file.mime_type?.startsWith("image/") === true;

    if (!text && file.storage_path && !file.storage_path.startsWith("demo/stub/")) {
      try {
        const { data, error } = await supabase.storage.from("evidence").download(file.storage_path);
        if (error || !data) throw new Error("Storage download failed");

        if (isImageFile) {
          const buffer = Buffer.from(await data.arrayBuffer());
          const base64Image = buffer.toString("base64");
          const mimeType = file.mime_type || "image/jpeg";
          
          text = await generateVision({
            prompt: "Extract all visible text, numbers, dates, and core context from this screenshot or document image. Output only the extracted information cleanly.",
            base64Image,
            mimeType
          });
        } else if (file.file_type === "text" || file.mime_type?.includes("text")) {
          text = await data.text();
        } else if (file.file_type === "pdf") {
          text = `[PDF Parsing explicitly disabled to preserve dependency stability. File: ${file.file_name}]`;
        }
      } catch (err) {
        console.error(`[Redressa] Parsing failed for ${file.file_name}:`, err);
        text = `[Error parsing file during extraction: ${file.file_name}]`;
      }
    } else if (!text && file.storage_path?.startsWith("demo/stub/")) {
       // Demo file seed passthrough
       text = `[Demo content simulated for ${file.file_name}]`;
    }

    if (!file.parsed_text && text) {
      await supabase
        .from("case_files")
        .update({ parsed_text: text })
        .eq("id", file.id);
    }

    parsed.push({
      file_id: file.id,
      file_name: file.file_name,
      file_type: file.file_type,
      parsed_text: text,
    });
  }

  await addCaseEvent({
    case_id: caseId,
    event_type: "parsing_complete",
    title: "Evidence parsed",
    detail: `${parsed.length} file(s) processed`,
    metadata: { file_count: parsed.length },
  });

  return parsed;
}
