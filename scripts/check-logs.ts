import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentLogs() {
  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);
    
  if (!cases || cases.length === 0) {
    console.log("No cases found.");
    return;
  }
  
  const recentCase = cases[0];
  console.log("Recent Case:", recentCase.id, recentCase.status);
  
  const { data: files } = await supabase
    .from("case_files")
    .select("id, file_name, file_type, file_size, parsed_text")
    .eq("case_id", recentCase.id);
    
  console.log("\nFiles:", JSON.stringify(files?.map(f => ({ ...f, parsed_text: f.parsed_text?.slice(0, 50) })), null, 2));
  
  const { data: events } = await supabase
    .from("case_events")
    .select("event_type, detail, metadata")
    .eq("case_id", recentCase.id)
    .order("created_at", { ascending: true });
    
  console.log("\nEvents:", JSON.stringify(events, null, 2));
}

checkRecentLogs();
