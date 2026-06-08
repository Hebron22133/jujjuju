import { requireProfile } from "@/lib/auth";
import TransactionsClient from "./transactions-client";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const { supabase, profile } = await requireProfile();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return <TransactionsClient initialProfile={profile} initialTransactions={transactions || []} userId={profile.id} />;
}
