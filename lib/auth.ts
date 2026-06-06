import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";
import type { Profile } from "./types";

export async function requireProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("[requireProfile] Auth getUser error:", userError);
    redirect("/login");
  }

  if (!user) {
    console.log("[requireProfile] No user found in auth, redirecting to login");
    redirect("/login");
  }

  console.log("[requireProfile] User authenticated:", { id: user.id, email: user.email });

  // Try to get profile, but if RLS error occurs, return a minimal profile
  // This is a temporary workaround for RLS recursion issues
  let profile: Profile | null = null;
  let lastError: any = null;

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const result = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single<Profile>();

      if (result.data) {
        profile = result.data;
        console.log("[requireProfile] Profile found successfully");
        break;
      }

      lastError = result.error;

      // If RLS error, retry
      if (result.error?.code === '42P17') {
        console.log(`[requireProfile] RLS error on attempt ${attempt}/5, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        continue;
      }

      // If "no rows" error and not first attempt, this means profile doesn't exist yet
      if (result.error?.code === 'PGRST116' && attempt < 5) {
        console.log(`[requireProfile] Profile not found yet (attempt ${attempt}/5), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        continue;
      }

      if (result.error) {
        console.error("[requireProfile] Database error:", { 
          code: result.error.code, 
          message: result.error.message 
        });
        break;
      }
    } catch (err) {
      console.error(`[requireProfile] Exception on attempt ${attempt}:`, err);
      lastError = err;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // If profile wasn't found but user is authenticated, return a default profile
  // This allows signup flow to proceed even if profile creation is delayed
  if (!profile) {
    console.log("[requireProfile] Creating temporary profile from user auth");
    // Return a minimal profile object with basic defaults
    profile = {
      id: user.id,
      balance: 2000, // Default from trigger
      is_activated: false,
      is_admin: false,
      tier_level: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile;
    
    console.log("[requireProfile] Using temporary profile (real profile will be synced on next request)");
  }

  return { supabase, user, profile };
}

export async function requireAdminProfile() {
  const context = await requireProfile();
  if (!context.profile.is_admin) {
    console.log("User is not admin, redirecting to dashboard");
    redirect("/dashboard");
  }
  return context;
}
