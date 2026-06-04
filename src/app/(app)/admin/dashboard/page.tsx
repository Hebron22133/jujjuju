import { Message } from "@/components/ui/Message";
import { money, shortDate } from "@/lib/format";
import { requireAdminProfile } from "@/lib/auth";
import type { Profile, Withdrawal } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdminProfile();

  const [
    { data: totalUsers },
    { data: activeUsers },
    { data: pendingOrders },
    { data: pendingWithdrawals },
  ] = await Promise.all([
    supabase.from("users").select("id").returns<{ id: string }[]>(),
    supabase
      .from("users")
      .select("id")
      .eq("is_activated", true)
      .returns<{ id: string }[]>(),
    supabase
      .from("orders")
      .select("id")
      .in("status", ["pending", "assigned"])
      .returns<{ id: string }[]>(),
    supabase
      .from("withdrawals")
      .select("id")
      .eq("status", "pending")
      .returns<{ id: string }[]>(),
  ]);

  return (
    <>
      <Message message={params.message} type={params.type} />
      <section className="panel">
        <div className="panel-title">System Overview</div>
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{totalUsers?.length ?? 0}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{activeUsers?.length ?? 0}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value">{pendingOrders?.length ?? 0}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Withdrawals Pending</div>
            <div className="stat-value">{pendingWithdrawals?.length ?? 0}</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Quick Links</div>
        <div className="list">
          <a href="/admin/users" className="list-item">
            <div className="list-line">
              <strong>Manage Users</strong>
            </div>
            <div className="tiny">View and activate/deactivate users</div>
          </a>
          <a href="/admin/orders" className="list-item">
            <div className="list-line">
              <strong>Manage Orders</strong>
            </div>
            <div className="tiny">Create and assign orders to users</div>
          </a>
          <a href="/admin/withdrawals" className="list-item">
            <div className="list-line">
              <strong>Withdrawals</strong>
            </div>
            <div className="tiny">Review and approve withdrawal requests</div>
          </a>
        </div>
      </section>
    </>
  );
}
