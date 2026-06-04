import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/config";

export async function GET(request: Request) {
  // Only allow in development or with a special token
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const config = {
      supabaseUrl: getSupabaseUrl(),
      supabaseAnonKeyLength: getSupabaseAnonKey().length,
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: "ok",
      config,
      auth: {
        user: user ? { id: user.id, email: user.email } : null,
        error: userError?.message || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Diagnostic error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
