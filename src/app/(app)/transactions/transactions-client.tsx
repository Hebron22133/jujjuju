'use client'

import React, { useState, useEffect, useRef } from 'react'
import { money, shortDate } from "@/lib/format";
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

export default function TransactionsClient({ 
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
          <p>Your account is awaiting admin activation. Once activated, you'll see your transaction history.</p>
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
            <div className="stat-value">{transactions?.length || 0}</div>
          </div>
        </div>
      </section>
    </>
  );
}
