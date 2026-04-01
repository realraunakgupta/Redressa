/**
 * Redressa - Safe Development Data Cleanup
 *
 * This script wipes out all operational test data generated during development
 * or evaluation testing, returning the system to a clean state.
 *
 * PRESERVES:
 * - The policy corpus (`company_policies`, `regulations`)
 * - Seeded demo cases (cases marked `is_demo=true`)
 * - User accounts / OAuth tokens
 *
 * WIPES:
 * - Real/test user cases (`cases` where `is_demo=false`)
 * - Related `case_events`
 * - Related `communication_threads`
 * - Related `inbound_messages` & `outbound_messages`
 * - Uploaded test evidence in Supabase Storage (`evidence` bucket)
 *
 * Usage:
 * npm run cleanup:dev -- --confirm
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const args = process.argv.slice(2);
  const isConfirmed = args.includes("--confirm");

  console.log("=== Redressa Development Cleanup ===");
  if (!isConfirmed) {
    console.log(
      "\nWARNING: This will permanently delete test cases, events, threads, messages, and raw storage files."
    );
    console.log("\nTo proceed, you must run:");
    console.log("  npm run cleanup:dev -- --confirm\n");
    process.exit(0);
  }

  console.log("\n[1/5] Identifying test cases to remove...");
  const { data: testCases, error: casesError } = await supabase
    .from("cases")
    .select("id")
    .eq("is_demo", false);

  if (casesError) {
    console.error("Failed to query cases:", casesError.message);
    process.exit(1);
  }

  if (!testCases || testCases.length === 0) {
    console.log("No non-demo cases found. System is already clean.");
    return;
  }

  const caseIds = testCases.map((c) => c.id);
  console.log(`Found ${caseIds.length} test case(s) to remove.\n`);

  // Note: Due to Supabase foreign key CASCADE deletes on phase-e schemas,
  // deleting the case automatically cascades to case_events, communication_threads,
  // inbound_messages, outbound_messages, and case_files DB rows.
  // HOWEVER, we must manually delete the physical files from the Storage bucket.

  console.log("[2/5] Identifying linked storage files...");
  const { data: filesToDelete, error: filesError } = await supabase
    .from("case_files")
    .select("storage_path")
    .in("case_id", caseIds);

  if (filesError) {
    console.error("Failed to query case files:", filesError.message);
    process.exit(1);
  }

  if (filesToDelete && filesToDelete.length > 0) {
    const paths = filesToDelete.map((f) => f.storage_path).filter(Boolean);
    console.log(`Deleting ${paths.length} physical file(s) from 'evidence' bucket...`);
    
    // Chunk deletions to avoid request URI too long errors ideally, but small scale is fine
    const { error: storageError } = await supabase.storage
      .from("evidence")
      .remove(paths);

    if (storageError) {
      console.error("Storage deletion warning:", storageError.message);
    } else {
      console.log("Storage cleanup complete.");
    }
  } else {
    console.log("No linked storage files to delete.");
  }


  console.log("\n[3/5] Deleting database rows (Cascading)...");
  const { error: deleteError } = await supabase
    .from("cases")
    .delete()
    .in("id", caseIds);

  if (deleteError) {
    console.error("Failed to delete cases:", deleteError.message);
    process.exit(1);
  }

  console.log("Test cases, events, and communication threads deleted.");
  console.log("\n[4/5] Preserving policy corpus and demo cases...");
  console.log("[5/5] Cleanup complete. Repository is operational.\n");
}

main().catch(console.error);
