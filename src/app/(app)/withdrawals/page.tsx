import { requireProfile } from "@/lib/auth";
import WithdrawalsClient from "./withdrawals-client";
import { Message } from "@/components/ui/Message";

export const dynamic = "force-dynamic";

export default async function WithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await requireProfile();

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Message message={params.message} type={params.type} />
      <WithdrawalsClient 
        initialProfile={profile} 
        initialWithdrawals={withdrawals || []} 
        userId={profile.id}
        message={params.message}
        type={params.type}
      />
    </>
  );
}
