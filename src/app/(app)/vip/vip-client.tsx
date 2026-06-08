'use client'

import React, { useState, useEffect, useRef } from 'react'
import { money } from "@/lib/format";
import { tierName } from "@/lib/tiers";

interface Profile {
  id: string;
  balance: number;
  is_activated: boolean;
  tier_level: number;
  email: string;
  created_at: string;
}

export default function VIPContent({ initialProfile, userId }: { initialProfile: Profile | null; userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());

    // Start polling every 3 seconds to check for activation
    pollingIntervalRef.current = setInterval(() => {
      fetchProfile(true);
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [userId]);

  const fetchProfile = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const response = await fetch(`/api/user/profile?id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  if (!profile) {
    return (
      <section className="panel">
        <div className="panel-title" style={{ color: "#e74c3c" }}>Error</div>
        <div className="content" style={{ padding: "20px" }}>
          <p>Could not load your profile. Please try refreshing the page.</p>
        </div>
      </section>
    );
  }

  if (!profile?.is_activated) {
    return (
      <>
        <section className="panel">
          <div className="panel-title" style={{ color: "#e74c3c" }}>⏳ Account Not Yet Activated</div>
          <div className="content" style={{ padding: "20px" }}>
            <p>Your account is awaiting admin activation. Once activated, you'll see your VIP tier benefits and current standing.</p>
            <p style={{ fontSize: "14px", color: "#666" }}>Current Balance: <strong>₦{(profile?.balance || 0).toLocaleString()}</strong></p>

            {/* Activation Instructions */}
            <div style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "5px"
            }}>
              <p style={{ marginTop: 0, marginBottom: "10px", fontSize: "14px", color: "#856404" }}>
                <strong>📋 To Get Activated:</strong>
              </p>
              <ol style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#856404" }}>
                <li>Make a transfer of <strong>₦2,000</strong> to the account details below</li>
                <li>Contact admin with proof of payment</li>
                <li>Admin will activate your account and add ₦2,000 to your balance</li>
              </ol>
              <div style={{
                marginTop: "15px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
                fontSize: "13px"
              }}>
                <p style={{ margin: "0 0 5px 0" }}>
                  <strong>Account Details:</strong>
                </p>
                <p style={{ margin: "3px 0", fontSize: "12px" }}>
                  Bank: <strong>Sterling Bank</strong>
                </p>
                <p style={{ margin: "3px 0", fontSize: "12px" }}>
                  Account: <strong>8523569562</strong>
                </p>
                <p style={{ margin: "3px 0", fontSize: "12px" }}>
                  Name: <strong>Flutterwave/Jumia NG</strong>
                </p>
              </div>
            </div>

            {/* Auto-refresh indicator */}
            <div style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#e3f2fd",
              border: "1px solid #90caf9",
              borderRadius: "5px",
              fontSize: "12px",
              color: "#1565c0"
            }}>
              <span>🔄 Page auto-refreshes every 3 seconds</span>
              {lastUpdated && (
                <p style={{ margin: "5px 0 0 0", fontSize: "11px" }}>
                  Last checked: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

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
        <div className="panel-title">✅ Your VIP Status</div>
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
