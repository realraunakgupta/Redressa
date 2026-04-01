import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerAuthClient(cookieStore);
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL!));
}
