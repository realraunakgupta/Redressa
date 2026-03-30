import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCasePageData } from "@/lib/case-data";
import { AgentActivityPanel } from "./panels/agent-activity";
import { ExtractedFactsPanel } from "./panels/extracted-facts";
import { CitationsPanel } from "./panels/citations";
import { RecommendationPanel } from "./panels/recommendation";
import { GeneratedOutputsPanel } from "./panels/generated-outputs";
import { EvidencePackPanel } from "./panels/evidence-pack";
import { EvidenceDebug } from "./panels/evidence-debug";
import { LeftRail } from "@/app/components/left-rail";

export default async function CasePage(props: PageProps<"/case/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const showDebug = searchParams?.debug === "1";

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

  const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
    intake: { label: "Intake", dot: "bg-neutral-400", text: "text-neutral-400" },
    processing: { label: "Processing", dot: "bg-accent-400", text: "text-accent-400" },
    evaluated: { label: "Evaluated", dot: "bg-primary-400", text: "text-primary-400" },
    complete: { label: "Complete", dot: "bg-success-500", text: "text-success-500" },
    error: { label: "Error", dot: "bg-error-500", text: "text-error-500" },
  };

  const status = statusConfig[caseRow.status] ?? statusConfig.intake;

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Top Bar ── */}
      <header className="border-b border-neutral-800 bg-neutral-900 shrink-0">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight text-neutral-50">
            Redressa<span className="text-primary-500 ml-1">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/new"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
            >
              New Claim
            </Link>
          </div>
        </div>
      </header>

      {/* ── Layout Wrapper ── */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-stretch overflow-hidden">
        <LeftRail activePath="case" />
        
        {/* ── Case Content ── */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <nav className="mb-6">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              {"< "}Back to workspace
            </Link>
          </nav>

          {/* Case Header */}
          <div className="mb-8 rounded-lg border border-neutral-800 bg-neutral-800/30 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">Case</p>
                <h1 className="mt-1 text-xl font-bold text-neutral-50">
                  {caseRow.merchant_name ?? "Complaint"} —{" "}
                  {caseRow.subcategory?.replace(/_/g, " ") ?? caseRow.category ?? "Unclassified"}
                </h1>
                <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{caseRow.description}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-800 px-3 py-1">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${status.dot}`} />
                <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
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
                  {new Date(caseRow.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  })}
                </strong>
              </span>
            </div>
          </div>

          {/* Panel Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div id="extraction"><ExtractedFactsPanel facts={facts} timeline={timeline} /></div>
              {showDebug && <EvidenceDebug data={data} />}
              <div id="outputs"><GeneratedOutputsPanel outputs={outputs} /></div>
              <div id="documents"><EvidencePackPanel outputs={outputs} /></div>
            </div>

            <div className="space-y-6">
              <AgentActivityPanel events={events} />
              <CitationsPanel citations={allCitations} />
              <RecommendationPanel evaluation={evaluation} routes={routes} />
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-10 border-t border-neutral-800 pt-6">
            <p className="text-xs text-neutral-600 max-w-2xl">
              This analysis is generated by an automated workflow for informational guidance only.
              It does not constitute legal advice. Consult a qualified professional before taking
              any action based on this output.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
