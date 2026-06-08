import { requireProfile } from "@/lib/auth";
import OrdersClient from "./orders-client";
import { Message } from "@/components/ui/Message";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await requireProfile();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("assigned_to", profile.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Message message={params.message} type={params.type} />
      <OrdersClient 
        initialProfile={profile} 
        initialOrders={orders || []} 
        userId={profile.id}
        message={params.message}
        type={params.type}
      />
    </>
  );
}
