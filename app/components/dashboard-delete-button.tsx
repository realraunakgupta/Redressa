"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "./toast";

interface Props {
  caseId: string;
  isDemo: boolean;
}

export function DashboardDeleteButton({ caseId, isDemo }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/case/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Deletion failed");
      }
      setConfirming(false);
      setShowToast(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert("Failed to delete: " + msg);
      setDeleting(false);
      setConfirming(false);
    }
  };

  // Only hide for built-in seed cases (demo-aviation, demo-ecommerce)
  // User-created claims that triggered the demo path should still be deletable
  if (caseId.startsWith("demo-")) return null;

  return (
    <>
      {showToast && (
        <Toast
          message="Your claim was deleted successfully."
          onDone={() => {
            setShowToast(false);
            router.refresh();
          }}
        />
      )}

      {confirming ? (
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm text-[var(--color-error)] border border-[var(--color-error)]/40 bg-[var(--color-error)]/5 hover:bg-[var(--color-error)]/15 transition-colors disabled:opacity-50"
          >
            {deleting ? "…" : "Yes"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm text-on-surface-muted border border-[var(--color-border-ghost)] hover:border-[var(--color-border-solid)] transition-colors"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirming(true);
          }}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-on-surface-muted/40 hover:text-[var(--color-error)] p-1 rounded-sm"
          title="Delete this claim"
          aria-label="Delete claim"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      )}
    </>
  );
}
