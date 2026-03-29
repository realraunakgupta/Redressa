import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCasePageData } from "@/lib/case-data";
import { AgentActivityPanel } from "./panels/agent-activity";
import { ExtractedFactsPanel } from "./panels/extracted-facts";
import { CitationsPanel } from "./panels/citations";
import { RecommendationPanel } from "./panels/recommendation";
import { GeneratedOutputsPanel } from "./panels/generated-outputs";
import { EvidencePackPanel } from "./panels/evidence-pack";

export default async function CasePage(props: PageProps<"/case/[id]">) {
  const { id } = await props.params;

  if (id === "new") {
    const { redirect } = await import("next/navigation");
    redirect("/new");
  }

  const data = await loadCasePageData(id);
  if (!data) notFound();

  const {
    caseRow,
    events,
    outputs,
    facts,
    timeline,
    evaluation,
    routes,
    policyCitations,
    regulationCitations,
  } = data;

  const allCitations = [...(policyCitations ?? []), ...(regulationCitations ?? [])];

  const statusConfig: Record<string, { label: string; color: string }> = {
    intake: { label: "Intake", color: "bg-neutral-500/20 text-neutral-400" },
    processing: { label: "Processing", color: "bg-accent-400/20 text-accent-400" },
    evaluated: { label: "Evaluated", color: "bg-primary-400/20 text-primary-400" },
    complete: { label: "Complete", color: "bg-success-500/20 text-success-500" },
    error: { label: "Error", color: "bg-error-500/20 text-error-500" },
  };

  const status = statusConfig[caseRow.status] ?? statusConfig.intake;

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-6">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
            {"< "}Back to home
          </Link>
        </nav>

        <div className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">Case</p>
              <h1 className="mt-1 text-xl font-bold text-neutral-50">
                {caseRow.merchant_name ?? "Complaint"} -{" "}
                {caseRow.subcategory?.replace(/_/g, " ") ?? caseRow.category ?? "Unclassified"}
              </h1>
              <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{caseRow.description}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-500">
            {caseRow.merchant_name && (
              <span>
                Merchant: <strong className="text-neutral-300">{caseRow.merchant_name}</strong>
              </span>
            )}
            {caseRow.order_reference && (
              <span>
                Ref: <strong className="text-neutral-300">{caseRow.order_reference}</strong>
              </span>
            )}
            {caseRow.amount && (
              <span>
                Amount:{" "}
                <strong className="text-neutral-300">INR {caseRow.amount.toLocaleString()}</strong>
              </span>
            )}
            <span>
              Filed:{" "}
              <strong className="text-neutral-300">
                {new Date(caseRow.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ExtractedFactsPanel facts={facts} timeline={timeline} />
            <GeneratedOutputsPanel outputs={outputs} />
            <EvidencePackPanel outputs={outputs} />
          </div>

          <div className="space-y-6">
            <AgentActivityPanel events={events} />
            <CitationsPanel citations={allCitations} />
            <RecommendationPanel evaluation={evaluation} routes={routes} />
          </div>
        </div>
      </div>
    </main>
  );
}
