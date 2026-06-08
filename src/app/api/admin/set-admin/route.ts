import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user - only admins can call this
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if current user is admin
    const { data: userProfile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!userProfile?.is_admin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get request body
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const {
      data: { users },
    } = await supabase.auth.admin.listUsers();

    const targetUser = users?.find((u) => u.email === email);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user to be admin
    const { error } = await supabase
      .from("users")
      .update({ is_admin: true })
      .eq("id", targetUser.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${email} is now an admin`,
      userId: targetUser.id,
    });
  } catch (error) {
    console.error("Error setting admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
