"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Toast } from "./toast";

interface ClaimRow {
  id: string;
  status: string;
  category: string | null;
  subcategory: string | null;
  description: string;
  merchant_name: string | null;
  is_demo: boolean;
  created_at: string;
}

const STATUS_STYLE: Record<string, { label: string; dot: string; text: string }> = {
  intake: { label: "Intake", dot: "bg-neutral-400", text: "text-neutral-400" },
  processing: { label: "Processing", dot: "bg-accent-400", text: "text-accent-400" },
  evaluated: { label: "Evaluated", dot: "bg-primary-400", text: "text-primary-400" },
  complete: { label: "Complete", dot: "bg-success-500", text: "text-success-500" },
  error: { label: "Error", dot: "bg-error-500", text: "text-error-500" },
};

export function ClaimsTable({ cases }: { cases: ClaimRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const deletableCases = cases.filter((c) => !c.id.startsWith("demo-"));
  const allDeletableSelected =
    deletableCases.length > 0 && deletableCases.every((c) => selected.has(c.id));

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allDeletableSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(deletableCases.map((c) => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (
      !confirm(
        `Are you sure you want to permanently delete ${selected.size} claim${selected.size > 1 ? "s" : ""}? This cannot be undone.`
      )
    )
      return;

    setDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const caseId of selected) {
      try {
        const res = await fetch("/api/case/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ case_id: caseId }),
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    setSelected(new Set());
    setDeleting(false);

    if (failCount > 0) {
      setToast(`Deleted ${successCount} claim${successCount !== 1 ? "s" : ""}. ${failCount} failed.`);
    } else {
      setToast(`${successCount} claim${successCount !== 1 ? "s" : ""} deleted successfully.`);
    }
  };

  const handleSingleDelete = async (caseId: string) => {
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
      setToast("Your claim was deleted successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert("Failed to delete: " + msg);
    }
    setDeleting(false);
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast}
          onDone={() => {
            setToast(null);
            router.refresh();
          }}
        />
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-sm border border-primary/20 bg-primary/5 px-4 py-2.5">
          <span className="text-xs font-sans font-medium text-primary">
            {selected.size} claim{selected.size > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm text-[var(--color-error)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 hover:bg-[var(--color-error)]/15 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting…" : `Delete ${selected.size}`}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-sm border border-[var(--color-border-solid)] bg-base">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-[var(--color-border-solid)] bg-surface-low">
              <th className="w-10 px-3 py-4">
                {deletableCases.length > 0 && (
                  <input
                    type="checkbox"
                    checked={allDeletableSelected}
                    onChange={toggleAll}
                    className="accent-[var(--color-primary)] h-3.5 w-3.5 cursor-pointer rounded-sm"
                    title="Select all"
                  />
                )}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-on-surface-muted tracking-widest">
                Claim
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-on-surface-muted tracking-widest hidden sm:table-cell">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-on-surface-muted tracking-widest hidden md:table-cell">
                Filed
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium uppercase text-on-surface-muted tracking-widest">
                Status
              </th>
              <th className="w-10 px-3 py-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-solid)]">
            {cases.map((c) => {
              const s = STATUS_STYLE[c.status] ?? STATUS_STYLE.intake;
              const isSeed = c.id.startsWith("demo-");
              const isSelected = selected.has(c.id);

              return (
                <tr
                  key={c.id}
                  className={`transition-colors group cursor-pointer ${
                    isSelected
                      ? "bg-primary/5"
                      : "hover:bg-surface-low"
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-4 text-center">
                    {!isSeed ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleOne(c.id);
                        }}
                        className={`accent-[var(--color-primary)] h-3.5 w-3.5 cursor-pointer rounded-sm transition-opacity ${
                          isSelected
                            ? "opacity-100"
                            : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        }`}
                      />
                    ) : null}
                  </td>

                  {/* Claim info */}
                  <td className="px-6 py-4">
                    <Link href={`/case/${c.id}`} className="block">
                      <p className="font-serif font-medium text-lg text-on-base truncate max-w-md group-hover:text-primary transition-colors">
                        {c.merchant_name ?? "Complaint"} —{" "}
                        {c.subcategory?.replace(/_/g, " ") ?? "General"}
                      </p>
                      <p className="mt-1.5 text-sm text-on-surface-muted truncate max-w-md">
                        {c.description.slice(0, 80)}
                        {c.description.length > 80 ? "…" : ""}
                      </p>
                    </Link>
                  </td>

                  <td className="px-6 py-4 text-sm text-on-surface-muted capitalize hidden sm:table-cell">
                    {c.category ?? "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-on-surface-muted hidden md:table-cell">
                    {new Date(c.created_at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      timeZone: "Asia/Kolkata",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                    </span>
                  </td>

                  {/* Single delete */}
                  <td className="px-3 py-4 text-center">
                    {!isSeed && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm("Delete this claim permanently?")) {
                            handleSingleDelete(c.id);
                          }
                        }}
                        disabled={deleting}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity text-on-surface-muted/40 hover:text-[var(--color-error)] p-1 rounded-sm"
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
