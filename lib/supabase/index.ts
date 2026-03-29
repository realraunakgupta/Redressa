/**
 * Supabase module barrel export
 */

export { createBrowserSupabaseClient, createServerSupabaseClient } from "./client";
export type {
  Database,
  CaseRow,
  CaseInsert,
  CaseFileRow,
  CaseEventRow,
  PolicyDocRow,
  PolicyChunkRow,
  GeneratedOutputRow,
} from "./types";
export {
  createCase,
  getCase,
  updateCaseStatus,
  listCases,
  addCaseFile,
  getCaseFiles,
  addCaseEvent,
  getCaseEvents,
  getLatestCaseEventByType,
  getPolicyChunks,
  addGeneratedOutput,
  getCaseOutputs,
} from "./helpers";
