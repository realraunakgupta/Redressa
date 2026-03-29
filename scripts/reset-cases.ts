import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in .env.local");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeCases() {
  console.log("Purging all cases and related records...");
  
  // Since schemas use ON DELETE CASCADE, dropping cases will wipe case_events,
  // case_files, and generated_outputs.
  const { error } = await supabase
    .from("cases")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all non-null UUIDs
    
  if (error) {
    console.error("Purge failed:", error);
    process.exit(1);
  }
  
  console.log("Database purge complete. Ready for final deployment!");
}

purgeCases();
