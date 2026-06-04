import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AdminDashboardClient from './client';

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  
  // Note: Admin auth is handled via simple token in localStorage
  // The frontend will check for admin_token and redirect to login if missing

  // Get stats
  const [{ count: totalUsers }, { count: activeUsers }, { data: pendingWithdrawals }] =
    await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_activated', true),
      supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  return <AdminDashboardClient totalUsers={totalUsers} activeUsers={activeUsers} pendingWithdrawals={pendingWithdrawals} />;
}
    </div>
  );
}
