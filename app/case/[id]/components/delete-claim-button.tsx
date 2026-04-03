"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/app/components/toast";

export function DeleteClaimButton({ caseId, isDemo }: { caseId: string; isDemo: boolean }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleDelete = async () => {
    if (caseId.startsWith("demo-")) {
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

      setShowToast(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert("Failed to delete claim: " + message);
      setIsDeleting(false);
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message="Your claim was deleted successfully."
          onDone={() => {
            router.push("/");
            router.refresh();
          }}
        />
      )}
      <button
        onClick={handleDelete}
        disabled={isDeleting || caseId.startsWith("demo-")}
        className={`text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors ${
          caseId.startsWith("demo-")
            ? "text-on-surface-muted/30 cursor-not-allowed border-transparent"
            : "text-[var(--color-error)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 hover:bg-[var(--color-error)]/10"
        }`}
        title={caseId.startsWith("demo-") ? "Demo cases cannot be deleted" : "Delete this claim permanently"}
      >
        {isDeleting ? "Deleting..." : "Delete Claim"}
      </button>
    </>
  );
}
