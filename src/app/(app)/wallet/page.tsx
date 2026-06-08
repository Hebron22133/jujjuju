import { requireProfile } from "@/lib/auth";
import WalletClient from "./wallet-client";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const { supabase, profile } = await requireProfile();
  
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return <WalletClient initialProfile={profile} initialTransactions={transactions || []} userId={profile.id} />;
}
