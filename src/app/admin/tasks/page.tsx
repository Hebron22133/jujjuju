import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminTasksPage() {
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

  // Get tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  // Get levels
  const { data: levels } = await supabase
    .from('levels')
    .select('*')
    .order('id');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Task Management</h1>

      <div style={{ marginBottom: '30px' }}>
        <h2>Create Task</h2>
        <form action="/api/admin/create-task" method="POST">
          <div style={{ marginBottom: '10px' }}>
            <label>Level:</label>
            <select name="level_id" required style={{ width: '100%', padding: '8px' }}>
              <option value="">-- Select Level --</option>
              {levels?.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.name} (₦{l.daily_commission}/day)
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Title:</label>
            <input name="title" required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Description:</label>
            <textarea name="description" style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" style={{ padding: '10px 20px' }}>
            Create Task
          </button>
        </form>
      </div>

      <h2>All Tasks</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Level</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Title</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Description</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks?.map((t: any) => (
            <tr key={t.id}>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>Level {t.level_id}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{t.title}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{t.description}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
