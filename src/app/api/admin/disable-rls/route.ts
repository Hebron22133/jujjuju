import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Disable RLS on all tables
    const tables = ["users", "transactions", "orders", "withdrawals"];
    
    for (const table of tables) {
      const { error } = await supabase.rpc("execute_sql", {
        sql: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`,
      });

      if (error && !error.message?.includes("does not exist")) {
        console.error(`Error disabling RLS for ${table}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "RLS disabled for all tables" 
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
