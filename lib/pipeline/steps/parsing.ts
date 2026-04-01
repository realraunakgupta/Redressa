/**
 * Pipeline Step: Evidence Parsing
 *
 * Reads case files and extracts/stores parsed text.
 * Text-like files are decoded directly where possible.
 * Images and screenshots are sent through the OCR adapter.
 * DOCX files are parsed directly via mammoth (no OCR needed).
 */

import sharp from "sharp";
import mammoth from "mammoth";
import { getCaseFiles, addCaseEvent } from "@/lib/supabase/helpers";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { extractDocumentText } from "@/lib/document/client";

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
  const fileDiagnostics: Record<string, unknown>[] = [];

  for (const file of files) {
    let text = file.parsed_text ?? "";
    // If a previous run cached an error string as parsed_text, discard it so we retry OCR
    if (text.startsWith("[Error")) {
      text = "";
    }
    const isImageFile =
      file.file_type === "image" ||
      file.file_type === "screenshot" ||
      file.mime_type?.startsWith("image/") === true;
    const isPdfFile = file.file_type === "pdf" || file.mime_type?.includes("pdf") === true;
    const isDocxFile =
      file.mime_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.file_name?.endsWith(".docx") === true;

    const diagnostic = {
      file_name: file.file_name,
      file_type: file.file_type,
      mime_type: file.mime_type,
      storage_path: file.storage_path,
      used_ocr_adapter: false,
      ocr_provider: null as string | null,
      ocr_attempted: false,
      ocr_succeeded: false,
      ocr_error: null as string | null,
      parsed_text_length: 0,
      parsed_text_preview: null as string | null,
    };

    if (!text && file.storage_path && !file.storage_path.startsWith("demo/stub/")) {
      try {
        const { data, error } = await supabase.storage.from("evidence").download(file.storage_path);
        if (error || !data) throw new Error("Storage download failed");

        if (isImageFile || isPdfFile) {
          diagnostic.used_ocr_adapter = true;
          diagnostic.ocr_provider = "ocr_space";
          diagnostic.ocr_attempted = true;

          let fileBytes = new Uint8Array(await data.arrayBuffer());
          let mimeType = file.mime_type || (isPdfFile ? "application/pdf" : "image/jpeg");

          // Compress large images to fit OCR.space free-tier 1024KB limit.
          const OCR_MAX_BYTES = 700 * 1024;
          if (isImageFile && fileBytes.length > OCR_MAX_BYTES) {
            let quality = 85;
            let maxDim = 2000;

            let compressed = await sharp(fileBytes)
              .grayscale()
              .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
              .jpeg({ quality })
              .toBuffer();

            while (compressed.length > OCR_MAX_BYTES && quality > 30) {
              quality -= 10;
              maxDim = Math.max(800, maxDim - 300);
              compressed = await sharp(fileBytes)
                .grayscale()
                .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
                .jpeg({ quality })
                .toBuffer();
            }

            fileBytes = new Uint8Array(compressed);
            mimeType = "image/jpeg";
            console.log(
              `[Redressa] Compressed ${file.file_name}: ${file.file_size} -> ${fileBytes.length} bytes (q=${quality}, max=${maxDim}px)`
            );
          }

          const base64Data = Buffer.from(fileBytes).toString("base64");
          text = await extractDocumentText({ base64Data, mimeType });
          diagnostic.ocr_succeeded = !!text;
        } else if (isDocxFile) {
          // DOCX contains structured text — extract directly, no OCR needed
          const buffer = Buffer.from(await data.arrayBuffer());
          const result = await mammoth.extractRawText({ buffer });
          text = result.value?.trim() || "";
          if (!text) {
            text = `[DOCX file contained no extractable text: ${file.file_name}]`;
          }
        } else if (file.file_type === "text" || file.mime_type?.includes("text")) {
          text = await data.text();
        } else {
          text = `[Unsupported file format explicitly dropped. File: ${file.file_name}]`;
        }
      } catch (err) {
        const errorMessage = String(err);
        console.error(`[Redressa] Parsing failed for ${file.file_name}:`, errorMessage);
        text = `[Error parsing document during OCR extraction: ${errorMessage}]`;
        diagnostic.ocr_error = errorMessage;
        diagnostic.ocr_succeeded = false;
      }
    } else if (!text && file.storage_path?.startsWith("demo/stub/")) {
      text = `[Demo content simulated for ${file.file_name}]`;
    }

    if (!text) {
      text = `[Parsing Pipeline Error: Extraction returned blank for ${file.file_name}]`;
      if (diagnostic.used_ocr_adapter) {
        diagnostic.ocr_error = "Blank result from adapter.";
        diagnostic.ocr_succeeded = false;
      }
    }

    diagnostic.parsed_text_length = text.length;
    diagnostic.parsed_text_preview = text.substring(0, 400).replace(/\n/g, " ");

    if (!file.parsed_text && text && !text.startsWith("[Error")) {
      await supabase.from("case_files").update({ parsed_text: text }).eq("id", file.id);
    }

    parsed.push({
      file_id: file.id,
      file_name: file.file_name,
      file_type: file.file_type,
      parsed_text: text,
    });

    fileDiagnostics.push(diagnostic);
  }

  await addCaseEvent({
    case_id: caseId,
    event_type: "parsing_complete",
    title: "Evidence parsed",
    detail: `${parsed.length} file(s) processed`,
    metadata: { file_count: parsed.length, file_diagnostics: fileDiagnostics },
  });

  return parsed;
}
