'use client'

import React, { useState, useEffect, useRef } from 'react'
import { StatusBadge } from "@/components/ui/StatusBadge";
import { money, shortDate } from "@/lib/format";
import { tierName } from "@/lib/tiers";
import type { Transaction } from "@/lib/types";

interface Profile {
  id: string;
  balance: number;
  is_activated: boolean;
  tier_level: number;
}

interface TransactionData extends Transaction {
  created_at: string;
}

export default function WalletClient({ 
  initialProfile, 
  initialTransactions,
  userId 
}: { 
  initialProfile: Profile | null;
  initialTransactions: TransactionData[];
  userId: string;
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [transactions, setTransactions] = useState<TransactionData[]>(initialTransactions);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());

    // Start polling every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchData(true);
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [userId]);

  const fetchData = async (isPolling = false) => {
    try {
      const [profileRes, transRes] = await Promise.all([
        fetch(`/api/user/profile?id=${userId}`),
        fetch(`/api/user/transactions?id=${userId}`)
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (transRes.ok) {
        const transData = await transRes.json();
        setTransactions(transData.transactions || []);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (!profile?.is_activated) {
    return (
      <section className="panel">
        <div className="panel-title" style={{ color: "#e74c3c" }}>⏳ Account Not Yet Activated</div>
        <div className="content" style={{ padding: "20px" }}>
          <p>Your account is awaiting admin activation. Once activated, you'll see your wallet and transaction history.</p>
          <p style={{ fontSize: "14px", color: "#666" }}>Current Balance: <strong>₦{(profile?.balance || 0).toLocaleString()}</strong></p>

          <div style={{
            marginTop: "20px",
            padding: "15px",
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
    );
  }

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
