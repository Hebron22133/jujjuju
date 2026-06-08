'use client'

import React, { useState, useEffect, useRef } from 'react'
import { requestWithdrawalAction } from "@/actions/app";
import { ActivationNotice } from "@/components/ui/ActivationNotice";
import { Message } from "@/components/ui/Message";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BankInfoModal } from "@/components/BankInfoModal";
import { money, shortDate } from "@/lib/format";
import type { Withdrawal } from "@/lib/types";

interface Profile {
  id: string;
  balance: number;
  is_activated: boolean;
  tier_level: number;
  bank_name?: string;
  bank_code?: string;
  account_number?: string;
  account_holder_name?: string;
}

export default function WithdrawalsClient({
  initialProfile,
  initialWithdrawals,
  userId,
  message,
  type
}: {
  initialProfile: Profile;
  initialWithdrawals: Withdrawal[];
  userId: string;
  message?: string;
  type?: string;
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());

    // Polling every 3 seconds when not activated
    if (!profile.is_activated) {
      pollingIntervalRef.current = setInterval(() => {
        fetchData();
      }, 3000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [profile.is_activated, userId]);

  const fetchData = async () => {
    try {
      const profileRes = await fetch(`/api/user/profile?id=${userId}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      // Only fetch withdrawals if activated
      if (profile.is_activated) {
        const withdrawalsRes = await fetch(`/api/user/withdrawals?id=${userId}`);
        if (withdrawalsRes.ok) {
          const withdrawalsData = await withdrawalsRes.json();
          setWithdrawals(withdrawalsData.withdrawals || []);
        }
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Show activation notice when polling (not activated)
  if (!profile.is_activated) {
    return (
      <>
        <Message message={message} type={type} />
        <ActivationNotice profile={profile} />
        
        {/* Auto-refresh indicator */}
        <div style={{
          padding: "12px",
          backgroundColor: "#e3f2fd",
          border: "1px solid #90caf9",
          borderRadius: "5px",
          fontSize: "12px",
          color: "#1565c0",
          marginBottom: "20px"
        }}>
          <span>🔄 Page auto-refreshes every 3 seconds</span>
          {lastUpdated && (
            <p style={{ margin: "5px 0 0 0", fontSize: "11px" }}>
              Last checked: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </>
    );
  }

  const pending = (withdrawals ?? []).filter((w) => w.status === "pending");
  const approved = (withdrawals ?? []).filter((w) => w.status === "approved");
  const rejected = (withdrawals ?? []).filter((w) => w.status === "rejected");

  return (
    <>
      <Message message={message} type={type} />
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
        <div className="panel-title">Bank Account Details</div>
        {profile.bank_name ? (
          <div style={{ marginBottom: "15px" }}>
            <div className="tiny"><strong>Current Bank:</strong> {profile.bank_name}</div>
            <div className="tiny"><strong>Account:</strong> {profile.account_number?.slice(-4).padStart(10, '*')}</div>
            {profile.account_holder_name && (
              <div className="tiny"><strong>Name:</strong> {profile.account_holder_name}</div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: "15px" }}>
            <p className="tiny" style={{ color: "#666" }}>No bank account configured yet</p>
          </div>
        )}
        <button 
          className="button small" 
          onClick={() => setShowBankModal(true)}
          style={{ marginTop: "10px" }}
        >
          {profile.bank_name ? "Update Bank Info" : "Add Bank Account"}
        </button>
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
            approved.slice(0, 20).map((withdrawal) => (
              <div className="list-item" key={withdrawal.id}>
                <div className="list-line">
                  <strong>{money(withdrawal.amount)}</strong>
                  <StatusBadge status={withdrawal.status} />
                </div>
                <div className="tiny">Approved: {shortDate(withdrawal.created_at)}</div>
              </div>
            ))
          ) : (
            <p className="tiny">No approved withdrawals.</p>
          )}
        </div>
      </section>

      {rejected.length > 0 && (
        <section className="panel">
          <div className="panel-title">Rejected Requests</div>
          <div className="list">
            {rejected.map((withdrawal) => (
              <div className="list-item" key={withdrawal.id}>
                <div className="list-line">
                  <strong>{money(withdrawal.amount)}</strong>
                  <StatusBadge status={withdrawal.status} />
                </div>
                <div className="tiny">Rejected: {shortDate(withdrawal.created_at)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showBankModal && (
        <BankInfoModal 
          userId={profile.id}
          currentBank={profile.bank_name ? {
            bank_name: profile.bank_name,
            bank_code: profile.bank_code || '',
            account_number: profile.account_number || '',
            account_holder_name: profile.account_holder_name
          } : undefined}
          onClose={() => setShowBankModal(false)}
          onSave={() => {
            fetchData();
          }}
        />
      )}
    </>
  );
}
