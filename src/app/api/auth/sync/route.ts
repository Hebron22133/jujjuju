import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify profile exists
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ authenticated: false, noProfile: true }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user, profile });
  } catch (error) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
