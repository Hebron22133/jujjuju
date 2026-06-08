import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VIPContent from "./vip-client";

export const dynamic = "force-dynamic";

export default async function VIPPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile for initial render
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return <VIPContent initialProfile={profile} userId={user.id} />;
}
