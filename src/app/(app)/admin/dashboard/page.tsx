import { requireAdminProfile } from "@/lib/auth";
import { money } from "@/lib/format";
import type { Profile, Order, Withdrawal } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdminProfile();

  // Fetch stats
  const [{ count: totalUsers }, { count: totalOrders }, { data: withdrawals }] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("withdrawals")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const { data: recentUsers } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<Profile[]>();

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<Order[]>();

  const totalWithdrawals = (withdrawals ?? []).length;
  const pendingAmount = (withdrawals ?? []).reduce((sum, w) => sum + (w.amount || 0), 0);

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>System overview and quick stats</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="admin-panel" style={{ padding: "16px" }}>
          <div className="stat-label">Total Agents</div>
          <h2 style={{ margin: "8px 0 0 0" }}>{totalUsers ?? 0}</h2>
          <p className="tiny" style={{ color: "#666", margin: "4px 0 0 0" }}>Active users</p>
        </div>
        <div className="admin-panel" style={{ padding: "16px" }}>
          <div className="stat-label">Total Tasks</div>
          <h2 style={{ margin: "8px 0 0 0" }}>{totalOrders ?? 0}</h2>
          <p className="tiny" style={{ color: "#666", margin: "4px 0 0 0" }}>Created tasks</p>
        </div>
        <div className="admin-panel" style={{ padding: "16px" }}>
          <div className="stat-label">Pending Withdrawals</div>
          <h2 style={{ margin: "8px 0 0 0" }}>{totalWithdrawals}</h2>
          <p className="tiny" style={{ color: "#666", margin: "4px 0 0 0" }}>{money(pendingAmount)}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <section className="admin-panel">
        <h3>Recent Tasks</h3>
        <div className="admin-table">
          {(recentOrders ?? []).length > 0 ? (
            (recentOrders ?? []).map((order) => (
              <div className="admin-row" key={order.id}>
                <div className="admin-cell">
                  <strong>{order.title}</strong>
                </div>
                <div className="admin-cell">
                  <div className="stat-label">Amount</div>
                  <strong>{money(order.amount)}</strong>
                </div>
                <div className="admin-cell">
                  <div className="stat-label">Commission</div>
                  <strong>{order.commission_rate}%</strong>
                </div>
                <div className="admin-cell">
                  <span className="badge">{order.status}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="tiny">No tasks created yet.</p>
          )}
        </div>
      </section>

      {/* Recent Users */}
      <section className="admin-panel" style={{ marginTop: "24px" }}>
        <h3>Recent Agents</h3>
        <div className="admin-table">
          {(recentUsers ?? []).length > 0 ? (
            (recentUsers ?? []).map((user) => (
              <div className="admin-row" key={user.id}>
                <div className="admin-cell">
                  <strong>Agent {user.id.slice(0, 8)}</strong>
                  <div className="tiny">{user.id}</div>
                </div>
                <div className="admin-cell">
                  <div className="stat-label">Balance</div>
                  <strong>{money(user.balance)}</strong>
                </div>
                <div className="admin-cell">
                  <span className={`badge ${user.is_activated ? "ok" : "warn"}`}>
                    {user.is_activated ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="tiny">No agents yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
