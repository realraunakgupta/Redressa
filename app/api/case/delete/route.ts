import { NextResponse } from "next/server";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { case_id } = await req.json();
    if (!case_id) {
      return NextResponse.json({ error: "Missing case_id" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createSupabaseServerAuthClient(cookieStore);

    // ── Auth Check ──
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Block demo case deletion ──
    if (case_id.startsWith("demo-")) {
      return NextResponse.json({ error: "Cannot delete built-in demo cases." }, { status: 403 });
    }

    // ── Ownership verification ──
    const { data: caseRow, error: fetchError } = await supabase
      .from("cases")
      .select("id, user_id")
      .eq("id", case_id)
      .single();

    if (fetchError || !caseRow) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }
    if (caseRow.user_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own cases." }, { status: 403 });
    }

    // ── Clean up uploaded evidence from Supabase Storage ──
    // Fetch file paths before cascade-deleting the DB rows
    const { data: caseFiles } = await supabase
      .from("case_files")
      .select("storage_path")
      .eq("case_id", case_id);

    if (caseFiles && caseFiles.length > 0) {
      const storagePaths = caseFiles
        .map((f: { storage_path: string }) => f.storage_path)
        .filter((p: string) => p && !p.startsWith("demo/"));

      if (storagePaths.length > 0) {
        // Use service role client for storage operations (browser auth client may lack permissions)
        const serviceClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { error: storageError } = await serviceClient.storage
          .from("evidence")
          .remove(storagePaths);

        if (storageError) {
          console.warn("Storage cleanup warning (non-fatal):", storageError.message);
          // Non-fatal: proceed with DB deletion even if storage cleanup fails
        }
      }
    }

    // ── Delete the case row (cascades to all child tables) ──
    const { error: deleteError } = await supabase
      .from("cases")
      .delete()
      .eq("id", case_id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Case deletion failed:", deleteError);
      return NextResponse.json({ error: "Failed to delete case from database." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete case error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
