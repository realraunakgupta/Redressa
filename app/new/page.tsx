"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEMO_AVIATION_CASE,
  DEMO_ECOMMERCE_CASE,
  type DemoCase,
} from "@/lib/demo-data";

type Category = "aviation" | "ecommerce";

const CATEGORY_OPTIONS: { value: Category; label: string; hint: string }[] = [
  { value: "aviation", label: "Aviation", hint: "Flight cancellation, delay, baggage (IndiGo)" },
  {
    value: "ecommerce",
    label: "E-Commerce",
    hint: "Damaged, defective, wrong item (Flipkart)",
  },
];

export default function NewClaimPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [merchantName, setMerchantName] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [amount, setAmount] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDemoFlag, setIsDemoFlag] = useState(false);

  function handleFillDemo(demoData: DemoCase) {
    setCategory(demoData.category);
    setMerchantName(demoData.merchantName);
    setOrderReference(demoData.orderReference);
    setAmount(demoData.amount);
    setDescription(demoData.description);
    setIsDemoFlag(true);

    // Seed demo file entries that match the bundled evidence artifacts.
    if (demoData.category === "aviation") {
      setFiles([
        new File(["demo evidence placeholder"], "indigo-cancellation-email.txt", {
          type: "text/plain",
        }),
      ]);
    } else {
      setFiles([
        new File(["demo evidence placeholder"], "flipkart-damaged-laptop.txt", {
          type: "text/plain",
        }),
        new File(["demo evidence placeholder"], "flipkart-return-denial.txt", {
          type: "text/plain",
        }),
      ]);
    }

    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Please describe your complaint.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          category: category || null,
          merchant_name: merchantName.trim() || null,
          order_reference: orderReference.trim() || null,
          amount: amount ? parseFloat(amount) : null,
          is_demo: isDemoFlag,
          files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push(`/case/${data.caseId}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-8">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
            {"< "}Back to home
          </Link>
        </nav>

        <h1 className="text-2xl font-bold text-neutral-50">File a New Claim</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Describe your complaint and the workflow will analyze it, retrieve relevant policies,
          and prepare your escalation documents.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleFillDemo(DEMO_AVIATION_CASE)}
            className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            Fill IndiGo demo case
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo(DEMO_ECOMMERCE_CASE)}
            className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            Fill Flipkart demo case
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <fieldset>
            <legend className="text-sm font-medium text-neutral-300">Category</legend>
            <div className="mt-2 flex gap-3">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={`flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${
                    category === opt.value
                      ? "border-primary-500 bg-primary-500/10 text-primary-300"
                      : "border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-neutral-500">{opt.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="merchant" className="block text-sm font-medium text-neutral-300">
              Company / Merchant
            </label>
            <input
              id="merchant"
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g. IndiGo, Flipkart"
              className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="order-ref" className="block text-sm font-medium text-neutral-300">
              Order / Booking Reference
              <span className="ml-1 text-neutral-600">(optional)</span>
            </label>
            <input
              id="order-ref"
              type="text"
              value={orderReference}
              onChange={(e) => setOrderReference(e.target.value)}
              placeholder="e.g. PNR, Order ID"
              className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-neutral-300">
              Amount (INR)
              <span className="ml-1 text-neutral-600">(optional)</span>
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              min="0"
              step="1"
              className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-300">
              Complaint Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened in detail. Include dates, actions you've already taken, and what resolution you're seeking."
              rows={6}
              className="mt-1.5 w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Evidence Files
              <span className="ml-1 text-neutral-600">(optional)</span>
            </label>
            <div className="mt-1.5 rounded-lg border border-dashed border-neutral-700 bg-neutral-900/30 px-6 py-6 text-center hover:bg-neutral-800/30 transition-colors">
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files));
                  }
                }}
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <span className="text-sm font-medium text-primary-400 hover:text-primary-300">
                  Click to select files
                </span>
                <span className="mt-1 block text-xs text-neutral-500">
                  Current Phase 1 flow records file metadata and still relies on pasted text for processing
                </span>
              </label>
            </div>
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300"
                  >
                    <span className="truncate pr-4">{f.name}</span>
                    <span className="text-neutral-500 shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-neutral-600">
              Selected files are tracked on the case record in this build. The analysis still uses the
              complaint description as the primary evidence source.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3">
              <p className="text-sm text-error-500">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !description.trim()}
            className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Processing claim..." : "Submit and analyze"}
          </button>

          {submitting && (
            <p className="text-center text-xs text-neutral-500">
              Your complaint is being processed. This may take 30-60 seconds.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
