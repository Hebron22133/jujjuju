import { processOrderAction } from "@/actions/app";
import { ActivationNotice } from "@/components/ui/ActivationNotice";
import { Message } from "@/components/ui/Message";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { money, shortDate } from "@/lib/format";
import { requireProfile } from "@/lib/auth";
import type { Order } from "@/lib/types";

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
    .order("created_at", { ascending: false })
    .returns<Order[]>();

  const assigned = (orders ?? []).filter((o) => o.status === "assigned");
  const completed = (orders ?? []).filter((o) => o.status === "completed");

  const calculateCommission = (amount: number, rate: number) => amount * (rate / 100);

  return (
    <>
      <Message message={params.message} type={params.type} />
      <ActivationNotice profile={profile} />

      <section className="panel">
        <div className="panel-title">Active Tasks ({assigned.length})</div>
        <div className="list">
          {assigned.length > 0 ? (
            assigned.map((order) => (
              <div className="list-item" key={order.id}>
                <div className="list-line">
                  <strong>{order.title || "Order"}</strong>
                  <StatusBadge status={order.status} />
                </div>
                <div className="tiny">
                  Amount: {money(order.amount)} | Commission: {order.commission_rate}% ({money(calculateCommission(order.amount, order.commission_rate))})
                </div>
                <div className="tiny">Posted: {shortDate(order.created_at)}</div>
                <form action={processOrderAction} style={{ marginTop: "0.5rem" }}>
                  <input type="hidden" name="order_id" value={order.id} />
                  <button className="button small" type="submit" disabled={!profile.is_activated}>
                    Process Order
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p className="tiny">
              {profile.is_activated
                ? "No orders assigned to you yet."
                : "Account must be activated to receive orders."}
            </p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Completed Tasks ({completed.length})</div>
        <div className="list">
          {completed.length > 0 ? (
            completed.slice(0, 20).map((order) => (
              <div className="list-item" key={order.id}>
                <div className="list-line">
                  <strong>{order.title || "Order"}</strong>
                  <StatusBadge status={order.status} />
                </div>
                <div className="tiny">
                  Amount: {money(order.amount)} | Earned: {money(calculateCommission(order.amount, order.commission_rate))}
                </div>
                <div className="tiny">Completed: {order.completed_at ? shortDate(order.completed_at) : "N/A"}</div>
              </div>
            ))
          ) : (
            <p className="tiny">No completed orders.</p>
          )}
          {completed.length > 20 ? (
            <p className="tiny">... and {completed.length - 20} more</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
