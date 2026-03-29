import type { CasePageData } from "@/lib/case-data";

interface EvidenceDiagnostic {
  file_name?: string;
  mime_type?: string | null;
  used_ocr_adapter?: boolean;
  ocr_provider?: string | null;
  ocr_attempted?: boolean;
  ocr_succeeded?: boolean;
  ocr_error?: string | null;
  parsed_text_length?: number;
  parsed_text_preview?: string | null;
}

export function EvidenceDebug({ data }: { data: CasePageData }) {
  if (!data.parsingMetadata && !data.extractionMetadata && (!data.files || data.files.length === 0)) {
    return null;
  }

  const diagnostics = (data.parsingMetadata?.file_diagnostics as EvidenceDiagnostic[]) || [];

  return (
    <div className="mb-6 rounded-xl border border-red-500/50 bg-red-950/20 p-6">
      <h2 className="mb-2 text-xl font-bold text-red-300">
        <span className="mr-2">DBG</span>
        [Development] Evidence OCR Trace Monitor
      </h2>
      <p className="mb-6 text-sm text-red-200/80">
        This panel is intentionally exposed to trace where uploaded evidence stops flowing into the pipeline.
      </p>

      <div className="space-y-6">
        <section className="rounded-lg bg-black/40 p-4">
          <h3 className="mb-3 border-b border-white/10 pb-2 font-medium text-white">
            1. Physical Files in Database (`case_files`)
          </h3>
          {data.files.length === 0 ? (
            <div className="text-sm text-red-400">No files persisted in the database.</div>
          ) : (
            <div className="space-y-4">
              {data.files.map((file) => (
                <div key={file.id} className="border-l-2 border-red-500/30 pl-3 text-sm">
                  <div className="text-zinc-300">
                    <span className="text-zinc-500">Name:</span> {file.file_name}
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-zinc-500">MIME:</span> {file.mime_type}
                  </div>
                  <div className="mt-1">
                    <span className="text-zinc-500">
                      Persisted DB Text ({file.parsed_text?.length || 0} chars):
                    </span>
                    {file.parsed_text ? (
                      <pre className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap rounded bg-black/60 p-2 font-mono text-xs text-zinc-300">
                        {file.parsed_text.substring(0, 500)}
                        {file.parsed_text.length > 500 ? "..." : ""}
                      </pre>
                    ) : (
                      <span className="ml-2 text-red-400">BLANK / NULL IN DATABASE</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-black/40 p-4">
          <h3 className="mb-3 border-b border-white/10 pb-2 font-medium text-white">
            2. OCR Extraction Diagnostics (`parsing_complete`)
          </h3>
          {diagnostics.length === 0 ? (
            <div className="text-sm text-zinc-500">No OCR diagnostics tracked.</div>
          ) : (
            <div className="space-y-4">
              {diagnostics.map((diag, i) => (
                <div key={i} className="border-l-2 border-orange-500/30 pl-3 text-sm">
                  <div className="text-zinc-300">
                    <span className="text-zinc-500">Target:</span> {diag.file_name} ({diag.mime_type})
                  </div>
                  {diag.used_ocr_adapter ? (
                    <>
                      <div className="text-zinc-300">
                        <span className="text-zinc-500">Provider:</span>
                        <span className="ml-2 text-blue-400">{diag.ocr_provider || "unknown"}</span>
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-zinc-500">OCR Attempted:</span> {diag.ocr_attempted ? "Yes" : "No"}
                      </div>
                      <div className="text-zinc-300">
                        <span className="text-zinc-500">OCR Succeeded:</span>{" "}
                        {diag.ocr_succeeded ? "Yes" : <span className="text-red-400">{diag.ocr_error}</span>}
                      </div>
                      <div className="mt-1">
                        <span className="text-zinc-500">
                          Injected Trace Text ({diag.parsed_text_length || 0} chars):
                        </span>
                        {diag.parsed_text_preview ? (
                          <div className="mt-1 break-all text-xs italic text-zinc-400">
                            &quot;{diag.parsed_text_preview}&quot;
                          </div>
                        ) : (
                          <span className="ml-2 text-red-400">BLANK</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="italic text-zinc-500">Bypassed OCR (raw text decode or demo stub)</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-black/40 p-4">
          <h3 className="mb-3 border-b border-white/10 pb-2 font-medium text-white">
            3. Final LLM Extraction Hook (`extraction_complete`)
          </h3>
          {data.extractionMetadata ? (
            <div className="space-y-2 text-sm">
              <div className="text-zinc-300">
                <span className="text-zinc-500">Did Groq ingest files?</span>{" "}
                {data.extractionMetadata.evidence_files_used ? (
                  <span className="ml-2 text-green-400">
                    Yes ({String(data.extractionMetadata.evidence_files_used)} file chunks)
                  </span>
                ) : (
                  <span className="ml-2 text-red-400">ZERO files ingested by LLM prompt mapping</span>
                )}
              </div>
              <div className="text-zinc-300">
                <span className="text-zinc-500">Total Evidence Character Dump:</span>{" "}
                {String(data.extractionMetadata.evidence_prompt_length || 0)} chars combined
              </div>
              {data.extractionMetadata.evidence_preview != null && (
                <div className="mt-1">
                  <span className="text-zinc-500">Raw Chunk Sent to LLM (First 400 chars):</span>
                  <div className="mt-1 rounded bg-green-950/20 p-2 text-xs italic break-all text-green-200/50">
                    &quot;{String(data.extractionMetadata.evidence_preview)}&quot;
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-zinc-500">No extraction metadata found.</div>
          )}
        </section>
      </div>
    </div>
  );
}
