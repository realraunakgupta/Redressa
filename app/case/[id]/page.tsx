import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { loadCasePageData } from "@/lib/case-data";
import { AgentActivityPanel } from "./panels/agent-activity";
import { ExtractedFactsPanel } from "./panels/extracted-facts";
import { CitationsPanel } from "./panels/citations";
import { RecommendationPanel } from "./panels/recommendation";
import { GeneratedOutputsPanel } from "./panels/generated-outputs";
import { EvidencePackPanel } from "./panels/evidence-pack";
import { CommunicationPanel } from "./panels/communication";
import { LeftRail } from "@/app/components/left-rail";
import { TopNav } from "@/app/components/top-nav";
import { MOCK_AVIATION_CASE, MOCK_ECOMMERCE_CASE } from "@/lib/mock-cases";
import type { CasePageData } from "@/lib/case-data";
import type { ExtractedFacts } from "@/lib/pipeline/steps/extraction";
import type { TimelineEntry } from "@/lib/pipeline/steps/timeline";
import type { EvaluationResult } from "@/lib/pipeline/steps/evaluation";
import type { EscalationRoute, Citation } from "@/lib/types";
import type {
  CommunicationThreadRow,
  GeneratedOutputRow,
  InboundMessageRow,
  OutboundMessageRow,
} from "@/lib/supabase/types";

export default async function CasePage(props: PageProps<"/case/[id]">) {
  const { id } = await props.params;
  await props.searchParams;

  if (id === "new") {
    const { redirect } = await import("next/navigation");
    redirect("/new");
  }

  const cookieStore = await cookies();
  const supabaseAuth = createSupabaseServerAuthClient(cookieStore);
  const { data: { user } } = await supabaseAuth.auth.getUser();

  let data: CasePageData | typeof MOCK_AVIATION_CASE | typeof MOCK_ECOMMERCE_CASE | null;
  if (id === "demo-aviation") {
    data = MOCK_AVIATION_CASE;
  } else if (id === "demo-ecommerce") {
    data = MOCK_ECOMMERCE_CASE;
  } else {
    data = await loadCasePageData(id, user?.id);
  }
  
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
    threads = [],
    messages = [],
    inboundMessages = [],
    hasGmail = false,
  } = data;

  const allCitations = [
    ...((policyCitations ?? []) as Citation[]),
    ...((regulationCitations ?? []) as Citation[]),
  ];

  const statusConfig: Record<string, { label: string; text: string; bg: string }> = {
    intake: { label: "Intake", text: "text-on-surface-muted", bg: "bg-surface" },
    processing: { label: "Processing", text: "text-primary", bg: "bg-primary/10" },
    evaluated: { label: "Evaluated", text: "text-primary", bg: "bg-primary/10" },
    complete: { label: "Complete", text: "text-[var(--color-success)]", bg: "bg-[var(--color-success)]/10" },
    error: { label: "Error", text: "text-[var(--color-error)]", bg: "bg-[var(--color-error)]/10" },
  };

  const status = statusConfig[caseRow.status] ?? statusConfig.intake;

  // --- Timeline Merging Logic ---
  const parsedTimeline = ((timeline as TimelineEntry[]) || []).map(entry => {
     let ts = 0;
     if (entry.date) {
        // Try parsing "24 Aug 2026", "2026-08-24", etc.
        const parsed = new Date(entry.date);
        if (!isNaN(parsed.getTime())) ts = parsed.getTime();
     }
     return { timestamp: ts, entry };
  });

  const allEvents = [...parsedTimeline];

  (messages as OutboundMessageRow[]).forEach(m => {
    if (m.status === "sent" && m.sent_at) {
       const d = new Date(m.sent_at);
       const isAuto = m.approved_by === "system_autopilot";
       allEvents.push({
          timestamp: d.getTime(),
          entry: {
             date: d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }),
             label: `Outbound Email Sent: ${m.subject} ${isAuto ? "[Autopilot]" : ""}`,
             source: "inferred"
          }
       });
    }
  });

  (inboundMessages as InboundMessageRow[]).forEach(m => {
    if (m.received_at) {
       const d = new Date(m.received_at);
       const catMap: Record<string, string> = {
          resolved: "Resolved",
          partial_resolution: "Partial Resolution",
          stalling: "Stalling",
          asking_for_info: "Request for Information",
          rejecting_liability: "Rejecting Liability",
          escalating_internally: "Escalated Internally",
          unclear: "Unclear Response"
       };
       const cleanCat = m.classification_category 
         ? catMap[m.classification_category] || m.classification_category.replace(/_/g, " ") 
         : null;
       const catString = cleanCat ? ` [${cleanCat}]` : "";
       
       allEvents.push({
          timestamp: d.getTime(),
          entry: {
             date: d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }),
             label: `Inbound Reply Received${catString}`,
             source: "inferred"
          }
       });
    }
  });

  // Sort valid timestamps ascending. Keep unparseable (ts=0) at the start (usually extracted facts).
  // Assuming all extracted facts happened before the agent communication.
  allEvents.sort((a, b) => {
     if (a.timestamp === 0 && b.timestamp === 0) return 0;
     if (a.timestamp === 0) return -1;
     if (b.timestamp === 0) return 1;
     return a.timestamp - b.timestamp;
  });

  const mergedTimeline = allEvents.map(e => e.entry);
  // -----------------------------

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />

      {/* ── Layout Wrapper ── */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-stretch overflow-hidden">
        <LeftRail activePath="case" />
        
        {/* ── Case Content ── */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <nav className="mb-8">
            <Link href="/" className="text-sm font-sans font-medium text-on-surface-muted hover:text-primary transition-colors flex items-center gap-2">
              <span>&larr;</span> Back to workspace
            </Link>
          </nav>

          {/* Case Header */}
          <div className="mb-10 rounded-sm border-[2px] border-[var(--color-border-solid)] bg-surface-low p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div>
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-on-surface-muted/80">Case Master Record</p>
                <h1 className="mt-3 text-3xl font-serif font-medium text-on-base">
                  {caseRow.merchant_name ?? "Complaint"} —{" "}
                  {caseRow.subcategory?.replace(/_/g, " ") ?? caseRow.category ?? "Unclassified"}
                </h1>
                <p className="mt-3 line-clamp-2 text-base font-sans text-on-surface-muted max-w-3xl leading-relaxed">{caseRow.description}</p>
              </div>
              <span className={`inline-flex shrink-0 items-center px-3 py-1.5 rounded-sm border border-[var(--color-border-solid)] ${status.bg}`}>
                <span className={`text-xs font-sans font-medium uppercase tracking-widest ${status.text}`}>[ {status.label} ]</span>
              </span>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--color-border-ghost)] flex flex-wrap gap-x-8 gap-y-3 text-sm font-sans text-on-surface-muted">
              {caseRow.merchant_name && (
                <span>
                  Merchant: <strong className="font-medium text-on-base">{caseRow.merchant_name}</strong>
                </span>
              )}
              {caseRow.order_reference && (
                <span>
                  Ref: <strong className="font-medium text-on-base">{caseRow.order_reference}</strong>
                </span>
              )}
              {caseRow.amount && (
                <span>
                  Amount:{" "}
                  <strong className="font-medium text-on-base">INR {caseRow.amount.toLocaleString()}</strong>
                </span>
              )}
              <span>
                Filed:{" "}
                <strong className="font-medium text-on-base">
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div id="extraction">
                <ExtractedFactsPanel
                  facts={facts as ExtractedFacts | null}
                  timeline={mergedTimeline}
                />
              </div>
              <div id="outputs">
                <GeneratedOutputsPanel outputs={outputs as GeneratedOutputRow[]} />
              </div>
              <div id="documents">
                <EvidencePackPanel outputs={outputs as GeneratedOutputRow[]} />
              </div>
            </div>

            <div className="space-y-6">
              <CommunicationPanel 
                threads={threads as CommunicationThreadRow[]} 
                messages={messages as OutboundMessageRow[]} 
                inboundMessages={inboundMessages as InboundMessageRow[]}
                hasGmail={hasGmail} 
                caseId={caseRow.id} 
              />
              <RecommendationPanel
                evaluation={evaluation as EvaluationResult | null}
                routes={routes as EscalationRoute[] | null}
              />
              <AgentActivityPanel events={events} />
              <CitationsPanel citations={allCitations} />
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-12 border-t border-[var(--color-border-ghost)] pt-8">
            <p className="text-xs font-sans text-on-surface-muted/60 max-w-3xl uppercase tracking-widest leading-relaxed">
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
