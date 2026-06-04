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
    console.error("Auth getUser error:", userError);
    redirect("/login");
  }

  if (!user) {
    console.log("No user found in auth");
    redirect("/login");
  }

  console.log("User found:", user.id, user.email);

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (profileError) {
    console.error("Profile query error:", profileError);
  }

  console.log("Profile query result:", { profile, error: profileError });

  if (profileError || !profile) {
    console.error("Profile error or not found - redirecting to login");
    redirect("/login");
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
