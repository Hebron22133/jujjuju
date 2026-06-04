import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";
import type { Profile } from "./types";

export async function requireProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No user found in auth");
    redirect("/login");
  }

  console.log("User found:", user.id, user.email);

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  console.log("Profile query result:", { profile, error });

  if (error || !profile) {
    console.error("Profile error or not found:", error);
    redirect("/login");
  }

  return { supabase, user, profile };
}

export async function requireAdminProfile() {
  const context = await requireProfile();
  if (!context.profile.is_admin) redirect("/dashboard");
  return context;
}
