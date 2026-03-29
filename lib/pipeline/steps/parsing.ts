/**
 * Pipeline Step: Evidence Parsing
 *
 * Reads case files and extracts/stores parsed text.
 * For Phase 1 MVP, evidence is text-based (pasted descriptions, email text).
 * File-based parsing (PDF, images) is stubbed.
 */

import { getCaseFiles, addCaseEvent } from "@/lib/supabase/helpers";
import { createServerSupabaseClient } from "@/lib/supabase/client";

export interface ParsedEvidence {
  file_id: string;
  file_name: string;
  file_type: string;
  parsed_text: string;
}

export async function stepParsing(caseId: string): Promise<ParsedEvidence[]> {
  const files = await getCaseFiles(caseId);
  const parsed: ParsedEvidence[] = [];

  for (const file of files) {
    let text = file.parsed_text ?? "";

    // For Phase 1, if parsed_text is already set (e.g. pasted text), use it.
    // For PDF/image files, this is a stub — real OCR/parsing comes in Phase 2.
    if (!text && file.file_type === "text") {
      text = "[Text content available but not yet extracted]";
    } else if (!text) {
      text = `[${file.file_type.toUpperCase()} parsing not yet implemented — file: ${file.file_name}]`;
    }

    // Update the file record with parsed text if it wasn't set
    if (!file.parsed_text && text) {
      const supabase = createServerSupabaseClient();
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
