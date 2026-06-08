'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Profile {
  id: string;
  balance: number;
  is_activated: boolean;
  tier_level: number;
  email: string;
}

export default function DashboardClient({ initialProfile, userId }: { initialProfile: Profile | null; userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
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
      const response = await fetch(`/api/user/profile?id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  if (!profile?.is_activated) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "50px auto" }}>
        <h1>⏳ Account Not Activated</h1>
        <p>Your account is awaiting admin activation. Once activated, you'll be able to access tasks and earn commissions.</p>
        <p style={{ marginTop: "15px", fontSize: "14px", color: "#666" }}>Current Balance: ₦{(profile?.balance || 0).toLocaleString()}</p>

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
    );
  }

  const tierNames: { [key: number]: string } = {
    0: "Tier 0",
    1: "Tier 1",
    2: "Tier 2",
    3: "Tier 3",
    4: "Tier 4",
    5: "Tier 5",
  };

  const commissionRates: { [key: number]: string } = {
    0: "1.2%",
    1: "1.5%",
    2: "2%",
    3: "2.5%",
    4: "3%",
    5: "3.5%",
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Welcome to Your Dashboard</h1>

      {/* Account Status */}
      <div style={{
        border: "2px solid #27ae60",
        padding: "20px",
        marginBottom: "30px",
        backgroundColor: "#f0fff4",
        borderRadius: "8px"
      }}>
        <h2 style={{ color: "#27ae60", marginTop: 0 }}>✓ Account Activated</h2>
        <p>Your account has been activated. You can now access tasks and start earning!</p>
      </div>

      {/* Balance & Tier */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        <div style={{ border: "1px solid #ddd", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
          <h3 style={{ marginTop: 0 }}>Your Balance</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#27ae60" }}>₦{(profile?.balance || 0).toLocaleString()}</p>
          <p style={{ fontSize: "12px", color: "#666" }}>Total account balance</p>
        </div>
        <div style={{ border: "1px solid #ddd", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
          <h3 style={{ marginTop: 0 }}>Your Tier</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#3498db" }}>{tierNames[profile?.tier_level || 0]}</p>
          <p style={{ fontSize: "12px", color: "#666" }}>Commission: {commissionRates[profile?.tier_level || 0]}</p>
        </div>
      </div>

      {/* Available Actions */}
      <div style={{ border: "1px solid #ddd", padding: "20px", marginBottom: "30px", borderRadius: "8px" }}>
        <h2>What's Next?</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li><strong>View Available Tasks</strong> - Check the Orders section to see tasks assigned to you</li>
          <li><strong>Complete Tasks</strong> - Earn commissions by completing assigned work</li>
          <li><strong>Check Your Progress</strong> - Visit the VIP section to see your tier benefits</li>
          <li><strong>Request Withdrawal</strong> - Go to Withdrawals when you're ready to cash out</li>
        </ul>
      </div>

      {/* Quick Links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <a
          href="/orders"
          style={{
            padding: "15px",
            backgroundColor: "#3498db",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            textAlign: "center",
            fontWeight: "bold"
          }}
        >
          📋 View Available Tasks
        </a>
        <a
          href="/withdrawals"
          style={{
            padding: "15px",
            backgroundColor: "#27ae60",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            textAlign: "center",
            fontWeight: "bold"
          }}
        >
          💰 Request Withdrawal
        </a>
      </div>
    </div>
  );
}
