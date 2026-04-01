import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createSupabaseServerAuthClient(cookieStore);
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { thread_id, mode } = await request.json().catch(() => ({}));
    if (!thread_id || !mode) {
      return NextResponse.json({ error: "thread_id and mode are required" }, { status: 400 });
    }

    const { error } = await supabaseAuth
      .from("communication_threads")
      .update({ automation_mode: mode, updated_at: new Date().toISOString() })
      .eq("id", thread_id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, mode });
  } catch (error) {
    console.error("[Redressa] Toggle Mode API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
