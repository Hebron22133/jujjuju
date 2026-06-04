'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminDashboardClientProps {
  totalUsers: number | null;
  activeUsers: number | null;
  pendingWithdrawals: any[] | null;
}

export default function AdminDashboardClient({ totalUsers, activeUsers, pendingWithdrawals }: AdminDashboardClientProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if admin token exists
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalUsers ?? 0}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px' }}>
          <h3>Active Users</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{activeUsers ?? 0}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px' }}>
          <h3>Pending Withdrawals</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{pendingWithdrawals?.length ?? 0}</p>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ marginTop: '30px' }}>
        <h2>Admin Functions</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <a href="/admin/users" style={{ padding: '10px', display: 'block', border: '1px solid #ddd' }}>
              Manage Users
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/admin/withdrawals" style={{ padding: '10px', display: 'block', border: '1px solid #ddd' }}>
              Approve Withdrawals
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/admin/tasks" style={{ padding: '10px', display: 'block', border: '1px solid #ddd' }}>
              Manage Tasks
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
