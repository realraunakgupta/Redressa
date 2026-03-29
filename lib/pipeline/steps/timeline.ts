/**
 * Pipeline Step: Timeline Assembly
 *
 * Builds a chronological timeline from extracted facts.
 * Purely deterministic — no LLM needed.
 */

import { addCaseEvent } from "@/lib/supabase/helpers";
import type { ExtractedFacts } from "./extraction";

export interface TimelineEntry {
  date: string;
  label: string;
  source: "complaint" | "evidence" | "inferred";
}

export async function stepTimeline(
  caseId: string,
  facts: ExtractedFacts
): Promise<TimelineEntry[]> {
  const entries: TimelineEntry[] = [];

  // Add dates from fact extraction
  for (const d of facts.dates) {
    entries.push({
      date: d.date,
      label: d.label,
      source: "complaint",
    });
  }

  // Add inferred timeline entries from consumer actions
  for (const action of facts.consumer_actions_taken) {
    entries.push({
      date: "", // no date available, will be sorted to end
      label: `Consumer action: ${action}`,
      source: "inferred",
    });
  }

  // Sort: dated entries first (chronological), then undated
  entries.sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return 0;
  });

  await addCaseEvent({
    case_id: caseId,
    event_type: "timeline_assembled",
    title: "Timeline assembled",
    detail: `${entries.length} event(s) in chronological order`,
    metadata: {
      total_entries: entries.length,
      dated_entries: entries.filter((e) => e.date).length,
      entries,
    },
  });

  return entries;
}
