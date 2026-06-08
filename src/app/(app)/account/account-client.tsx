'use client'

import React, { useState, useEffect, useRef } from 'react'
import { money } from "@/lib/format";
import { tierName } from "@/lib/tiers";
import { ActivationNotice } from "@/components/ui/ActivationNotice";
import Link from "next/link";

interface Profile {
  id: string;
  balance: number;
  is_activated: boolean;
  tier_level: number;
  created_at: string;
}

interface User {
  email: string;
}

export default function AccountClient({
  initialProfile,
  initialUser,
  userId
}: {
  initialProfile: Profile;
  initialUser: User;
  userId: string;
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [user, setUser] = useState<User>(initialUser);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
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
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <>
      {!profile.is_activated && (
        <>
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
      )}

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
    </>
  );
}
