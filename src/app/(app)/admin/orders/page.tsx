import { assignOrderAction, createOrderAction } from "@/actions/app";
import { Message } from "@/components/ui/Message";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { money, shortDate } from "@/lib/format";
import { requireAdminProfile } from "@/lib/auth";
import type { Order, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdminProfile();

  const [{ data: orders }, { data: users }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Order[]>(),
    supabase.from("users").select("id, balance").order("created_at", { ascending: false }).returns<
      Pick<Profile, "id" | "balance">[]
    >(),
  ]);

  const pendingOrders = (orders ?? []).filter((o) => o.status === "pending");
  const assignedOrders = (orders ?? []).filter((o) => o.status === "assigned");
  const completedOrders = (orders ?? []).filter((o) => o.status === "completed");

  return (
    <>
      <Message message={params.message} type={params.type} />
      <section className="panel">
        <div className="panel-title">Create Order</div>
        <form className="form" action={createOrderAction}>
          <div className="field">
            <label htmlFor="title">Order Title</label>
            <input
              className="input"
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Marketing Task"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="amount">Order Amount (₦)</label>
            <input
              className="input"
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="commission_rate">Commission Rate (%)</label>
            <input
              className="input"
              id="commission_rate"
              name="commission_rate"
              type="number"
              min="0"
              step="0.1"
              placeholder="1.2"
              defaultValue="1.2"
            />
          </div>
          <button className="button" type="submit">
            Create Order
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-title">Pending Orders ({pendingOrders.length})</div>
        <div className="admin-table">
          {pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
              <div className="list-item" key={order.id}>
                <div className="list-line">
                  <strong>{order.title || "Untitled"}</strong>
                  <StatusBadge status={order.status} />
                </div>
                <div className="tiny">
                  Amount: {money(order.amount)} | Commission: {order.commission_rate}% | Created:{" "}
                  {shortDate(order.created_at)}
                </div>
                <div className="admin-actions">
                  {users && users.length > 0 ? (
                    <form action={assignOrderAction} style={{ display: "flex", gap: "0.5rem" }}>
                      <input type="hidden" name="order_id" value={order.id} />
                      <select className="input small" name="user_id" required>
                        <option value="">Select user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.id.slice(0, 8)}... ({money(user.balance)})
                          </option>
                        ))}
                      </select>
                      <button className="button small" type="submit">
                        Assign
                      </button>
                    </form>
                  ) : (
                    <p className="tiny">No users available</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="tiny">No pending orders.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Assigned Orders ({assignedOrders.length})</div>
        <div className="admin-table">
          {assignedOrders.length > 0 ? (
            assignedOrders.map((order) => (
              <div className="list-item" key={order.id}>
                <div className="list-line">
                  <strong>{order.title || "Untitled"}</strong>
                  <StatusBadge status={order.status} />
                </div>
                <div className="tiny">
                  Amount: {money(order.amount)} | Commission: {order.commission_rate}% | Assigned to:{" "}
                  {order.assigned_to?.slice(0, 8)}... | Created: {shortDate(order.created_at)}
                </div>
              </div>
            ))
          ) : (
            <p className="tiny">No assigned orders.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Completed Orders ({completedOrders.length})</div>
        <div className="admin-table">
          {completedOrders.length > 0 ? (
            completedOrders.slice(0, 10).map((order) => (
              <div className="list-item" key={order.id}>
                <div className="list-line">
                  <strong>{order.title || "Untitled"}</strong>
                  <StatusBadge status={order.status} />
                </div>
                <div className="tiny">
                  Amount: {money(order.amount)} | Completed: {order.completed_at ? shortDate(order.completed_at) : "N/A"}
                </div>
              </div>
            ))
          ) : (
            <p className="tiny">No completed orders.</p>
          )}
          {completedOrders.length > 10 ? (
            <p className="tiny">... and {completedOrders.length - 10} more</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
