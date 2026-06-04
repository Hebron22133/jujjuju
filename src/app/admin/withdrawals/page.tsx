import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminWithdrawalsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  // Check admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!userProfile?.is_admin) {
    redirect('/admin/login?error=not_admin');
  }

  // Get withdrawals
  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select(`
      id,
      amount,
      status,
      created_at,
      user_id,
      level_id
    `)
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Withdrawal Requests</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>User</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Amount</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Level</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Date</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals?.map((w: any) => (
            <tr key={w.id}>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{w.user_id.slice(0, 8)}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>₦{w.amount}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>Level {w.level_id}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{w.status}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                {new Date(w.created_at).toLocaleDateString()}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                {w.status === 'pending' && (
                  <form action="/api/admin/approve-withdrawal" method="POST" style={{ display: 'inline' }}>
                    <input type="hidden" name="withdrawal_id" value={w.id} />
                    <button type="submit" style={{ padding: '5px 10px', marginRight: '5px' }}>
                      Approve
                    </button>
                  </form>
                )}
                {w.status === 'pending' && (
                  <form action="/api/admin/reject-withdrawal" method="POST" style={{ display: 'inline' }}>
                    <input type="hidden" name="withdrawal_id" value={w.id} />
                    <button type="submit" style={{ padding: '5px 10px', backgroundColor: '#ff6666', color: 'white' }}>
                      Reject
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
