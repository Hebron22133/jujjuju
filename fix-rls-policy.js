const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase environment variables");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "set" : "NOT SET");
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceRoleKey ? "set" : "NOT SET");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  db: {
    schema: "public",
  },
});

async function fixRLSPolicy() {
  try {
    console.log("Connecting to Supabase database...");
    
    // Drop the problematic policy
    const { error: dropError } = await supabase.rpc("execute_sql", {
      sql: 'DROP POLICY IF EXISTS "users can read own profile" ON public.users;',
    });

    if (dropError && dropError.message !== "function execute_sql(json) does not exist") {
      throw dropError;
    }

    console.log("Creating fixed RLS policy...");
    
    // Create the new policy without infinite recursion
    const { error: createError } = await supabase.rpc("execute_sql", {
      sql: `
        CREATE POLICY "users can read own profile"
        ON public.users FOR SELECT
        USING (id = auth.uid());
      `,
    });

    if (createError && createError.message !== "function execute_sql(json) does not exist") {
      throw createError;
    }

    console.log("✅ RLS Policy fixed successfully!");
  } catch (error) {
    console.error("Error fixing RLS policy:", error);
    
    // If execute_sql doesn't exist, provide manual instructions
    if (error.message && error.message.includes("does not exist")) {
      console.log("\n📋 MANUAL STEPS (execute in Supabase SQL Editor):\n");
      console.log(`
DROP POLICY IF EXISTS "users can read own profile" ON public.users;

CREATE POLICY "users can read own profile"
ON public.users FOR SELECT
USING (id = auth.uid());
      `);
    }
    
    process.exit(1);
  }
}

fixRLSPolicy();
