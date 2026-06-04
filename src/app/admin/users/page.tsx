import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
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

  // Get all users
  const { data: users } = await supabase
    .from('users')
    .select(`
      id, 
      email:auth.users(email), 
      is_activated, 
      level_id, 
      main_balance, 
      commission_balance,
      tier_level
    `)
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>User Management</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Level</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Main Balance</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Commission</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u: any) => (
            <tr key={u.id}>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                {typeof u.email === 'object' ? u.email.email : u.email}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{u.level_id || 'None'}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>₦{u.main_balance}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>₦{u.commission_balance}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                {u.is_activated ? 'Active' : 'Inactive'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                <form action="/api/admin/activate-user" method="POST" style={{ display: 'inline' }}>
                  <input type="hidden" name="user_id" value={u.id} />
                  <button type="submit" style={{ padding: '5px 10px' }}>
                    {u.is_activated ? 'Deactivate' : 'Activate'}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
