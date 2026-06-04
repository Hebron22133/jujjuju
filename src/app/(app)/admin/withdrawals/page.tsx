import { reviewWithdrawalAction } from "@/actions/app";
import { Message } from "@/components/ui/Message";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { money, shortDate } from "@/lib/format";
import { requireAdminProfile } from "@/lib/auth";
import type { Withdrawal } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdminProfile();

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Withdrawal[]>();

  const pending = (withdrawals ?? []).filter((w) => w.status === "pending");
  const approved = (withdrawals ?? []).filter((w) => w.status === "approved");
  const rejected = (withdrawals ?? []).filter((w) => w.status === "rejected");

  return (
    <>
      <Message message={params.message} type={params.type} />
      <section className="panel">
        <div className="panel-title">Pending Withdrawals ({pending.length})</div>
        <div className="admin-table">
          {pending.length > 0 ? (
            pending.map((withdrawal) => (
              <div className="list-item" key={withdrawal.id}>
                <div className="list-line">
                  <strong>{money(withdrawal.amount)}</strong>
                  <StatusBadge status={withdrawal.status} />
                </div>
                <div className="tiny">
                  User: {withdrawal.user_id.slice(0, 8)}... | Requested:{" "}
                  {shortDate(withdrawal.created_at)}
                </div>
                <div className="admin-actions">
                  <form action={reviewWithdrawalAction}>
                    <input type="hidden" name="withdrawal_id" value={withdrawal.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="button small" type="submit">
                      Approve
                    </button>
                  </form>
                  <form action={reviewWithdrawalAction}>
                    <input type="hidden" name="withdrawal_id" value={withdrawal.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button className="button danger small" type="submit">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <p className="tiny">No pending withdrawals.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Approved Withdrawals ({approved.length})</div>
        <div className="admin-table">
          {approved.length > 0 ? (
            approved.slice(0, 10).map((withdrawal) => (
              <div className="list-item" key={withdrawal.id}>
                <div className="list-line">
                  <strong>{money(withdrawal.amount)}</strong>
                  <StatusBadge status={withdrawal.status} />
                </div>
                <div className="tiny">
                  User: {withdrawal.user_id.slice(0, 8)}... | Approved:{" "}
                  {withdrawal.reviewed_at ? shortDate(withdrawal.reviewed_at) : "N/A"}
                </div>
              </div>
            ))
          ) : (
            <p className="tiny">No approved withdrawals.</p>
          )}
          {approved.length > 10 ? (
            <p className="tiny">... and {approved.length - 10} more</p>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Rejected Withdrawals ({rejected.length})</div>
        <div className="admin-table">
          {rejected.length > 0 ? (
            rejected.slice(0, 10).map((withdrawal) => (
              <div className="list-item" key={withdrawal.id}>
                <div className="list-line">
                  <strong>{money(withdrawal.amount)}</strong>
                  <StatusBadge status={withdrawal.status} />
                </div>
                <div className="tiny">
                  User: {withdrawal.user_id.slice(0, 8)}... | Rejected:{" "}
                  {withdrawal.reviewed_at ? shortDate(withdrawal.reviewed_at) : "N/A"}
                </div>
              </div>
            ))
          ) : (
            <p className="tiny">No rejected withdrawals.</p>
          )}
          {rejected.length > 10 ? (
            <p className="tiny">... and {rejected.length - 10} more</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
