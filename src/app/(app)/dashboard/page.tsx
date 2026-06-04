import Link from "next/link";
import { ClipboardList, WalletCards } from "lucide-react";
import { ActivationNotice } from "@/components/ui/ActivationNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { money, shortDate } from "@/lib/format";
import { requireProfile } from "@/lib/auth";
import { getNextTier, tierName } from "@/lib/tiers";
import type { Order, Transaction, Withdrawal } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { supabase, profile } = await requireProfile();
  const [{ data: orders }, { data: transactions }, { data: withdrawals }] = await Promise.all([
    supabase.from("orders").select("*").eq("assigned_to", profile.id).order("created_at", { ascending: false }).limit(3).returns<Order[]>(),
    supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(3).returns<Transaction[]>(),
    supabase.from("withdrawals").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(3).returns<Withdrawal[]>(),
  ]);

  const nextTier = getNextTier(profile.balance);

  return (
    <>
      <ActivationNotice profile={profile} />
      <section className="panel">
        <div className="panel-title">My Account</div>
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Balance</div>
            <div className="stat-value">{money(profile.balance)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Tier</div>
            <div className="stat-value">{tierName(profile.tier_level)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Activation</div>
            <StatusBadge status={profile.is_activated ? "Active" : "Inactive"} />
          </div>
          <div className="stat">
            <div className="stat-label">Next tier</div>
            <div className="stat-value">{nextTier ? money(nextTier) : "Max"}</div>
          </div>
        </div>
      </section>

      <section className="quick-links">
        <Link className="quick-link" href="/orders">
          <ClipboardList aria-hidden />
          <div>View Orders</div>
          <p className="tiny">Assigned tasks</p>
        </Link>
        <Link className="quick-link" href="/withdrawals">
          <WalletCards aria-hidden />
          <div>Withdraw Cash</div>
          <p className="tiny">Request payout</p>
        </Link>
      </section>

      <section className="panel">
        <div className="panel-title">Recent Orders</div>
        <div className="list">
          {(orders ?? []).map((order) => {
            const commission = order.amount * (order.commission_rate / 100);
            return (
              <div className="list-item" key={order.id}>
                <div className="list-line">
                  <strong>{order.title || money(order.amount)}</strong>
                  <StatusBadge status={order.status} />
                </div>
                <div className="tiny">
                  Amount: {money(order.amount)} | Potential earning: {money(commission)} ({order.commission_rate}%) - {shortDate(order.created_at)}
                </div>
              </div>
            );
          })}
          {!orders?.length ? <p className="tiny">No orders assigned to you yet.</p> : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Wallet Activity</div>
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
          {!transactions?.length ? <p className="tiny">No transactions yet.</p> : null}
        </div>
      </section>

      {withdrawals?.length ? (
        <section className="panel">
          <div className="panel-title">Withdrawals</div>
          <div className="list">
            {withdrawals.map((withdrawal) => (
              <div className="list-item" key={withdrawal.id}>
                <div className="list-line">
                  <strong>{money(withdrawal.amount)}</strong>
                  <StatusBadge status={withdrawal.status} />
                </div>
                <div className="tiny">{shortDate(withdrawal.created_at)}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
