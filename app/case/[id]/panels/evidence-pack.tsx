/**
 * Evidence Pack Preview Panel
 *
 * Shows the evidence pack preview document.
 * Data source: generated_outputs table (output_type = 'evidence_pack_preview')
 */

import type { GeneratedOutputRow } from "@/lib/supabase/types";

export function EvidencePackPanel({ outputs }: { outputs: GeneratedOutputRow[] }) {
  const packOutput = outputs.find((o) => o.output_type === "evidence_pack_preview");

  if (!packOutput) {
    return (
      <PanelShell title="Evidence Pack Preview">
        <p className="text-sm text-neutral-600">
          The evidence pack preview will appear after pipeline completion.
        </p>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Evidence Pack Preview">
      <div className="rounded-lg border border-neutral-800/50 bg-neutral-950/50 p-4">
        <pre className="whitespace-pre-wrap text-sm text-neutral-200 leading-relaxed font-sans">
          {packOutput.content}
        </pre>
      </div>
    </PanelShell>
  );
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </h2>
      {children}
    </div>
  );
}
