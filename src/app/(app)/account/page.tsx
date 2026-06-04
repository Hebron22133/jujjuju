import { requireProfile } from "@/lib/auth";
import { money } from "@/lib/format";
import { tierName } from "@/lib/tiers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { supabase, user, profile } = await requireProfile();

  return (
    <>
      <section className="panel">
        <div className="panel-title">Account Information</div>
        <div className="list">
          <div className="list-item">
            <div className="list-line">
              <strong>Email</strong>
              <span className="tiny">{user.email}</span>
            </div>
          </div>
          <div className="list-item">
            <div className="list-line">
              <strong>Account Status</strong>
              <span className={`badge ${profile.is_activated ? "ok" : "warn"}`}>
                {profile.is_activated ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="list-item">
            <div className="list-line">
              <strong>Member Since</strong>
              <span className="tiny">{new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Balance & Tier</div>
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Available Balance</div>
            <div className="stat-value">{money(profile.balance)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">VIP Tier</div>
            <div className="stat-value">{tierName(profile.tier_level)}</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <Link href="/vip" className="button secondary" style={{ textAlign: "center", padding: "12px" }}>
            View VIP Details
          </Link>
          <Link href="/withdrawals" className="button secondary" style={{ textAlign: "center", padding: "12px" }}>
            Request Withdrawal
          </Link>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Help & Support</div>
        <div className="content">
          <p className="tiny" style={{ marginBottom: "8px" }}>
            📧 Need help? Contact support at support@platform.com
          </p>
          <p className="tiny">📱 Have questions about your account or tasks? Check the FAQ or contact our support team.</p>
        </div>
      </section>
    </>
  );
}
