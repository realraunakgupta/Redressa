"use client";

/**
 * Evidence Pack Preview Panel
 *
 * Shows the evidence pack preview document.
 * Data source: generated_outputs table (output_type = 'evidence_pack_preview')
 */

import type { GeneratedOutputRow } from "@/lib/supabase/types";
import { useState } from "react";
import jsPDF from "jspdf";

export function EvidencePackPanel({ outputs }: { outputs: GeneratedOutputRow[] }) {
  const packOutput = outputs.find((o) => o.output_type === "evidence_pack_preview");
  const [isExporting, setIsExporting] = useState(false);

  if (!packOutput) {
    return (
      <PanelShell title="Evidence Pack Preview">
        <p className="text-sm font-sans text-on-surface-muted italic">
          The evidence pack preview will appear after pipeline completion.
        </p>
      </PanelShell>
    );
  }

  const handleExport = () => {
    setIsExporting(true);
    try {
      // standard a4 format configuration
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });
      
      let y = 50;

      // Clean presentation header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Redressa - Formal Evidence Pack", 40, y);
      y += 30;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      // Page break processing for long complaint stacks
      const splitText = doc.splitTextToSize(packOutput.content, 515); // A4 width is ~595pt
      
      for (let i = 0; i < splitText.length; i++) {
        if (y > 800) { // A4 height is ~842pt
          doc.addPage();
          y = 50;
        }
        doc.text(splitText[i], 40, y);
        y += 14; 
      }
      
      doc.save(`evidence-pack-protex.pdf`);
    } catch (err) {
      console.error("[jsPDF Error]", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PanelShell 
      title="Evidence Pack Preview"
      action={
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="text-[10px] font-sans font-bold uppercase tracking-widest bg-surface text-primary border border-[var(--color-border-solid)] hover:border-primary px-4 py-2 rounded-sm transition-colors disabled:opacity-50"
        >
          {isExporting ? "Generating..." : "Download PDF"}
        </button>
      }
    >
      <div className="rounded-sm border border-[var(--color-border-ghost)] bg-base p-6 shadow-inner">
        <pre className="whitespace-pre-wrap text-[13px] font-sans text-on-base leading-loose">
          {packOutput.content}
        </pre>
      </div>
    </PanelShell>
  );
}

function PanelShell({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-[var(--color-border-solid)] bg-surface-low p-6 sm:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border-ghost)] pb-4">
        <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-primary">
          {title}
        </h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}
