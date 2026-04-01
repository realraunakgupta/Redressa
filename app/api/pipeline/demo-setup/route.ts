import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { MOCK_AVIATION_CASE, MOCK_ECOMMERCE_CASE } from "@/lib/mock-cases";
import type { CaseInsert } from "@/lib/supabase/types";

// Use crypto.randomUUID for standard UUID generation
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createSupabaseServerAuthClient(cookieStore);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Authentication required: Please log in to enable Autopilot integrations and demo features." 
      }, { status: 401 });
    }

    const userId = user.id;
    const userName = user.user_metadata?.full_name || "Consumer";
    const supabase = createServerSupabaseClient();

    const { target } = await request.json(); // "demo-aviation" or "demo-ecommerce"

    if (target !== "demo-aviation" && target !== "demo-ecommerce") {
      return NextResponse.json({ error: "Invalid demo target" }, { status: 400 });
    }

    const mockData = target === "demo-aviation" ? MOCK_AVIATION_CASE : MOCK_ECOMMERCE_CASE;
    
    // Generate new UUIDs
    const newCaseId = crypto.randomUUID();
    const newThreadId = crypto.randomUUID();

    // 1. Insert Case Row
    const caseInsert: CaseInsert = {
      id: newCaseId,
      user_id: userId,
      status: mockData.caseRow.status as CaseInsert["status"],
      category: mockData.caseRow.category as CaseInsert["category"],
      subcategory: mockData.caseRow.subcategory,
      description: mockData.caseRow.description,
      merchant_name: mockData.caseRow.merchant_name,
      order_reference: mockData.caseRow.order_reference,
      amount: mockData.caseRow.amount,
      currency: mockData.caseRow.currency,
      is_demo: mockData.caseRow.is_demo,
    };
    const { error: caseError } = await supabase.from("cases").insert(caseInsert);

    if (caseError) throw new Error("Failed to insert case: " + caseError.message);

    // 2. Insert Events
    const eventsToInsert = [
      { id: crypto.randomUUID(), case_id: newCaseId, event_type: "intake_received", title: "Complaint received", detail: "Seed loaded", metadata: {}, created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), case_id: newCaseId, event_type: "extraction_complete", title: "Facts extracted", detail: "", metadata: { facts: mockData.facts }, created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), case_id: newCaseId, event_type: "timeline_assembled", title: "Timeline assembled", detail: "", metadata: { entries: mockData.timeline }, created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), case_id: newCaseId, event_type: "evaluation_complete", title: "Complaint evaluated", detail: "", metadata: { evaluation: mockData.evaluation }, created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), case_id: newCaseId, event_type: "route_recommended", title: "Routes generated", detail: "", metadata: { routes: mockData.routes }, created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), case_id: newCaseId, event_type: "policy_retrieved", title: "Policies fetched", detail: "", metadata: { citations: mockData.policyCitations }, created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), case_id: newCaseId, event_type: "regulation_retrieved", title: "Regulations fetched", detail: "", metadata: { citations: mockData.regulationCitations }, created_at: new Date().toISOString() }
    ];
    const { error: eventsError } = await supabase.from("case_events").insert(eventsToInsert);
    if (eventsError) throw new Error("Failed to insert events: " + eventsError.message);

    // 3. Insert Outputs (Files/Documents)
    if (mockData.outputs && mockData.outputs.length > 0) {
      const outputsToInsert = mockData.outputs.map((out) => ({
        id: crypto.randomUUID(),
        case_id: newCaseId,
        output_type: out.output_type,
        title: out.title,
        content: out.content.replace("[Your Name]", userName),
        citations: [],
        created_at: out.created_at,
      }));
      const { error: outputsError } = await supabase.from("generated_outputs").insert(outputsToInsert);
      if (outputsError) throw new Error("Failed to insert outputs: " + outputsError.message);
    }

    // 4. Insert Threads
    if (mockData.threads && mockData.threads.length > 0) {
      const threadsToInsert = mockData.threads.map((thread) => ({
        id: newThreadId,
        case_id: newCaseId,
        user_id: userId,
        channel: thread.channel,
        state: thread.state,
        automation_mode: thread.automation_mode,
        escalation_target: thread.escalation_target,
        target_email: thread.target_email,
        target_name: thread.target_name,
        created_at: thread.created_at,
      }));
      const { error: threadsError } = await supabase.from("communication_threads").insert(threadsToInsert);
      if (threadsError) throw new Error("Failed to insert threads: " + threadsError.message);
      
      // 5. Insert Messages
      if (mockData.messages && mockData.messages.length > 0) {
        const messagesToInsert = mockData.messages.map((msg) => ({
          id: crypto.randomUUID(),
          thread_id: newThreadId,
          case_id: newCaseId,
          user_id: userId,
          subject: msg.subject,
          body: msg.body.replace("[Your Name]", userName),
          from_address: msg.from_address,
          to_address: msg.to_address,
          status: msg.status,
          generation_source: msg.generation_source,
          created_at: msg.created_at,
        }));
        const { error: messagesError } = await supabase.from("outbound_messages").insert(messagesToInsert);
        if (messagesError) throw new Error("Failed to insert messages: " + messagesError.message);
      }
    }

    return NextResponse.json({ success: true, caseId: newCaseId });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Demo Setup] Failed:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
