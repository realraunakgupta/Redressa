/**
 * Pipeline Orchestrator
 *
 * Runs the full 10-step agent workflow for a case.
 * Each step emits a CaseEvent for visibility.
 *
 * Steps:
 * 1. Intake (creates case)
 * 2. Evidence parsing
 * 3. Fact extraction (Gemini)
 * 4. Timeline assembly
 * 5. Classification
 * 6. Policy retrieval
 * 7. Regulation retrieval (combined in step 6)
 * 8. Grounded evaluation (Gemini)
 * 9. Escalation route recommendation
 * 10. Output generation (Gemini)
 */

import { getCase, updateCaseStatus, addCaseEvent } from "@/lib/supabase/helpers";
import { stepIntake, type IntakeInput } from "./steps/intake";
import { stepParsing } from "./steps/parsing";
import { stepExtraction } from "./steps/extraction";
import { stepTimeline } from "./steps/timeline";
import { stepClassification } from "./steps/classification";
import { stepRetrieval } from "./steps/retrieval-step";
import { stepEvaluation } from "./steps/evaluation";
import { stepRouteSelection } from "./steps/route-selection";
import { stepOutputGeneration } from "./steps/output-generation";

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
 * Run the full pipeline starting from intake.
 * Creates a new case and processes it end-to-end.
 */
export async function runPipelineFromIntake(input: IntakeInput): Promise<string> {
  // Step 1: Intake
  const caseRow = await stepIntake(input);
  const caseId = caseRow.id;

  // Run the rest of the pipeline
  await runPipelineForCase(caseId);

  return caseId;
}

/**
 * Run the pipeline for an existing case (from step 2 onwards).
 * Useful for re-running a case after intake.
 */
export async function runPipelineForCase(caseId: string): Promise<void> {
  try {
    const caseRow = await getCase(caseId);
    if (!caseRow) {
      throw new Error(`Case ${caseId} not found`);
    }

    // Step 2: Parse evidence
    const evidence = await stepParsing(caseId);

    // Step 3: Extract facts (Gemini)
    const facts = await stepExtraction(caseId, caseRow.description, evidence);

    // Step 4: Assemble timeline
    const timeline = await stepTimeline(caseId, facts);

    // Step 5: Classify complaint
    const classification = await stepClassification(
      caseId,
      facts,
      caseRow.category as "aviation" | "ecommerce" | null
    );

    // Steps 6 & 7: Retrieve policies and regulations
    const retrieval = await stepRetrieval(
      caseId,
      classification.category,
      caseRow.description
    );

    // Step 8: Grounded evaluation (Gemini)
    const evaluation = await stepEvaluation(caseId, facts, timeline, retrieval);

    // Step 9: Escalation route recommendation
    const routes = await stepRouteSelection(
      caseId,
      classification.category,
      evaluation
    );

    // Step 10: Output generation (Gemini)
    await stepOutputGeneration(
      caseId,
      facts,
      timeline,
      evaluation,
      routes,
      retrieval
    );

    // Status is set to "complete" inside stepOutputGeneration
    await updateCaseStatus(caseId, "complete");
  } catch (error) {
    // Log the error as a case event and set status
    const message = error instanceof Error ? error.message : "Unknown error";

    await addCaseEvent({
      case_id: caseId,
      event_type: "error",
      title: "Pipeline error",
      detail: message,
    }).catch(() => {
      // Don't fail if event logging fails
    });

    await updateCaseStatus(caseId, "error").catch(() => {
      // Don't fail if status update fails
    });

    throw error;
  }
}

// Re-export step types for convenience
export type { IntakeInput } from "./steps/intake";
export type { ParsedEvidence } from "./steps/parsing";
export type { ExtractedFacts } from "./steps/extraction";
export type { TimelineEntry } from "./steps/timeline";
export type { ClassificationResult } from "./steps/classification";
export type { RetrievalStepResult } from "./steps/retrieval-step";
export type { EvaluationResult } from "./steps/evaluation";
