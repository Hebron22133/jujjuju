import { requireProfile } from "@/lib/auth";
import { money } from "@/lib/format";
import { tierName } from "@/lib/tiers";

export const dynamic = "force-dynamic";

export default async function VIPPage() {
  const { profile } = await requireProfile();

  const tiers = [
    { level: 1, name: "Tier 1", minBalance: 0, maxBalance: 4000, commission: "1.2%" },
    { level: 2, name: "Tier 2", minBalance: 4000, maxBalance: 10000, commission: "1.5%" },
    { level: 3, name: "Tier 3", minBalance: 10000, maxBalance: 50000, commission: "2%" },
    { level: 4, name: "Tier 4", minBalance: 50000, maxBalance: 500000, commission: "2.5%" },
    { level: 5, name: "Tier 5", minBalance: 500000, maxBalance: Infinity, commission: "3%" },
  ];

  return (
    <>
      <section className="panel">
        <div className="panel-title">Your VIP Status</div>
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Current Tier</div>
            <div className="stat-value">{tierName(profile.tier_level)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Current Balance</div>
            <div className="stat-value">{money(profile.balance)}</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">VIP Tier Benefits</div>
        <div className="list">
          {tiers.map((tier) => (
            <div
              className={`list-item ${tier.level === profile.tier_level ? "active" : ""}`}
              key={tier.level}
              style={tier.level === profile.tier_level ? { borderLeftColor: "var(--primary)", borderLeftWidth: "4px" } : {}}
            >
              <div className="list-line">
                <strong>{tier.name}</strong>
                <span className="badge ok">{tier.commission}</span>
              </div>
              <div className="tiny">
                Balance: {money(tier.minBalance)} - {tier.maxBalance === Infinity ? "Unlimited" : money(tier.maxBalance)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">How to Level Up</div>
        <div className="content">
          <p className="tiny">
            Complete more tasks and earn commissions to increase your balance. Each tier unlocks higher commission rates on future tasks.
          </p>
          <ul style={{ marginTop: "12px", paddingLeft: "20px" }}>
            <li className="tiny">Tier 2: Reach ₦4,000</li>
            <li className="tiny">Tier 3: Reach ₦10,000</li>
            <li className="tiny">Tier 4: Reach ₦50,000</li>
            <li className="tiny">Tier 5: Reach ₦500,000</li>
          </ul>
        </div>
      </section>
    </>
  );
}
