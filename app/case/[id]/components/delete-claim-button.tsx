"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteClaimButton({ caseId, isDemo }: { caseId: string; isDemo: boolean }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDemo) {
      alert("Cannot delete built-in demo cases.");
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this claim? This action cannot be undone and will remove all evidence, emails, and generated documents associated with this case.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch("/api/case/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Deletion failed");
      }

      router.push("/");
      router.refresh(); // refresh the workspace
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert("Failed to delete claim: " + message);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting || isDemo}
      className={`text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors ${
        isDemo
          ? "text-on-surface-muted/30 cursor-not-allowed border-transparent"
          : "text-[var(--color-error)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 hover:bg-[var(--color-error)]/10"
      }`}
      title={isDemo ? "Demo cases cannot be deleted" : "Delete this claim permanently"}
    >
      {isDeleting ? "Deleting..." : "Delete Claim"}
    </button>
  );
}
