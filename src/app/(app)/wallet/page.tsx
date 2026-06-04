import { StatusBadge } from "@/components/ui/StatusBadge";
import { money, shortDate } from "@/lib/format";
import { requireProfile } from "@/lib/auth";
import { tierName } from "@/lib/tiers";
import type { Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const { supabase, profile } = await requireProfile();
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Transaction[]>();

  return (
    <>
      <section className="panel">
        <div className="panel-title">Wallet Balance</div>
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Available balance</div>
            <div className="stat-value">{money(profile.balance)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Tier level</div>
            <div className="stat-value">{tierName(profile.tier_level)}</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Transactions</div>
        <div className="list">
          {(transactions ?? []).map((transaction) => (
            <div className="list-item" key={transaction.id}>
              <div className="list-line">
                <strong>{money(transaction.amount)}</strong>
                <StatusBadge status={transaction.status} />
              </div>
              <div className="tiny">{transaction.type.replaceAll("_", " ")} - {shortDate(transaction.created_at)}</div>
            </div>
          ))}
          {!transactions?.length ? <p className="tiny">No wallet activity.</p> : null}
        </div>
      </section>
    </>
  );
}
