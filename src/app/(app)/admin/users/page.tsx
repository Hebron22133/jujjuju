import { setUserActivationAction } from "@/actions/app";
import { Message } from "@/components/ui/Message";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { money, shortDate } from "@/lib/format";
import { requireAdminProfile } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdminProfile();

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Profile[]>();

  return (
    <>
      <Message message={params.message} type={params.type} />
      <section className="panel">
        <div className="panel-title">User Management</div>
        <div className="admin-table">
          {(users ?? []).length > 0 ? (
            <div className="table-header">
              <div className="table-row">
                <div className="cell">User ID</div>
                <div className="cell">Balance</div>
                <div className="cell">Status</div>
                <div className="cell">Tier</div>
                <div className="cell">Actions</div>
              </div>
            </div>
          ) : null}
          {(users ?? []).map((user) => (
            <div className="list-item" key={user.id}>
              <div className="list-line">
                <strong>{user.id.slice(0, 8)}...</strong>
                <StatusBadge status={user.is_activated ? "Active" : "Inactive"} />
              </div>
              <div className="tiny">
                Balance: {money(user.balance)} | Tier: {user.tier_level} | Created:{" "}
                {shortDate(user.created_at)}
              </div>
              <div className="admin-actions">
                <form action={setUserActivationAction}>
                  <input type="hidden" name="user_id" value={user.id} />
                  <input type="hidden" name="active" value={String(!user.is_activated)} />
                  <button className="button small secondary" type="submit">
                    {user.is_activated ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </div>
            </div>
          ))}
          {!users?.length ? <p className="tiny">No users found.</p> : null}
        </div>
      </section>
    </>
  );
}
