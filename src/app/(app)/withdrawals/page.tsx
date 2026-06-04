import { requestWithdrawalAction } from "@/actions/app";
import { ActivationNotice } from "@/components/ui/ActivationNotice";
import { Message } from "@/components/ui/Message";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { money, shortDate } from "@/lib/format";
import { requireProfile } from "@/lib/auth";
import type { Withdrawal } from "@/lib/types";

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
    .order("created_at", { ascending: false })
    .returns<Withdrawal[]>();

  const pending = (withdrawals ?? []).filter((w) => w.status === "pending");
  const approved = (withdrawals ?? []).filter((w) => w.status === "approved");
  const rejected = (withdrawals ?? []).filter((w) => w.status === "rejected");

  return (
    <>
      <Message message={params.message} type={params.type} />
      <ActivationNotice profile={profile} />

      <section className="panel">
        <div className="panel-title">Request Withdrawal</div>
        <form className="form" action={requestWithdrawalAction}>
          <div className="field">
            <label htmlFor="amount">Withdrawal Amount (₦)</label>
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
          <p className="tiny">Available balance: {money(profile.balance)}</p>
          <button className="button" type="submit" disabled={!profile.is_activated || profile.balance <= 0}>
            Request Withdrawal
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-title">Pending Requests ({pending.length})</div>
        <div className="list">
          {pending.length > 0 ? (
            pending.map((withdrawal) => (
              <div className="list-item" key={withdrawal.id}>
                <div className="list-line">
                  <strong>{money(withdrawal.amount)}</strong>
                  <StatusBadge status={withdrawal.status} />
                </div>
                <div className="tiny">Requested: {shortDate(withdrawal.created_at)}</div>
              </div>
            ))
          ) : (
            <p className="tiny">No pending withdrawal requests.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Completed Withdrawals</div>
        <div className="list">
          {approved.length > 0 ? (
            <>
              <div className="tiny" style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                Approved ({approved.length})
              </div>
              {approved.map((withdrawal) => (
                <div className="list-item" key={withdrawal.id}>
                  <div className="list-line">
                    <strong>{money(withdrawal.amount)}</strong>
                    <StatusBadge status={withdrawal.status} />
                  </div>
                  <div className="tiny">
                    Approved: {withdrawal.reviewed_at ? shortDate(withdrawal.reviewed_at) : "N/A"}
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {rejected.length > 0 ? (
            <>
              <div className="tiny" style={{ fontWeight: "bold", marginBottom: "1rem", marginTop: "1rem" }}>
                Rejected ({rejected.length})
              </div>
              {rejected.map((withdrawal) => (
                <div className="list-item" key={withdrawal.id}>
                  <div className="list-line">
                    <strong>{money(withdrawal.amount)}</strong>
                    <StatusBadge status={withdrawal.status} />
                  </div>
                  <div className="tiny">
                    Rejected: {withdrawal.reviewed_at ? shortDate(withdrawal.reviewed_at) : "N/A"}
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {approved.length === 0 && rejected.length === 0 ? (
            <p className="tiny">No completed withdrawals.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
