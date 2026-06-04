import { requireProfile } from "@/lib/auth";
import { money, shortDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const { supabase, profile } = await requireProfile();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<Transaction[]>();

  return (
    <>
      <section className="panel">
        <div className="panel-title">Transaction History</div>
        <div className="list">
          {(transactions ?? []).length > 0 ? (
            (transactions ?? []).map((transaction) => (
              <div className="list-item" key={transaction.id}>
                <div className="list-line">
                  <strong>{money(transaction.amount)}</strong>
                  <span className={`badge ${transaction.status === "completed" ? "ok" : "warn"}`}>
                    {transaction.status}
                  </span>
                </div>
                <div className="tiny">
                  {transaction.type.replaceAll("_", " ")} - {shortDate(transaction.created_at)}
                </div>
              </div>
            ))
          ) : (
            <p className="tiny">No transaction history yet.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Summary</div>
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Current Balance</div>
            <div className="stat-value">{money(profile.balance)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{transactions?.length ?? 0}</div>
          </div>
        </div>
      </section>
    </>
  );
}
