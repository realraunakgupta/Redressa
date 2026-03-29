/**
 * Pipeline Orchestrator
 *
 * This is the typed in-app pipeline for the Phase 1 agent workflow.
 * Each step will be implemented as a separate function.
 *
 * Pipeline steps (from Redressa_AI.txt, Section 9):
 * 1. Intake
 * 2. Evidence understanding (parsing)
 * 3. Fact normalization (extraction)
 * 4. Timeline assembly
 * 5. Policy and regulation retrieval
 * 6. Comparative reasoning (evaluation)
 * 7. Route selection
 * 8. Output generation
 * 9. Human review
 */

export type PipelineStep =
  | "intake"
  | "parsing"
  | "extraction"
  | "timeline"
  | "classification"
  | "policy_retrieval"
  | "regulation_retrieval"
  | "evaluation"
  | "route_selection"
  | "output_generation";

export const PIPELINE_STEPS: PipelineStep[] = [
  "intake",
  "parsing",
  "extraction",
  "timeline",
  "classification",
  "policy_retrieval",
  "regulation_retrieval",
  "evaluation",
  "route_selection",
  "output_generation",
];

/**
 * Run the full pipeline for a case.
 * Will be implemented step by step in the pipeline build phase.
 */
export async function runPipeline(_caseId: string): Promise<void> {
  // TODO: Implement each step and emit CaseEvents as they complete
  throw new Error("[Redressa] Pipeline not yet implemented.");
}
