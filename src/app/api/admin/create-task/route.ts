import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { user } = await supabase.auth.getUser().then(r => ({ user: r.data.user }));

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    const { data: adminProfile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 });
    }

    const body = await req.json();
    const { level_id, title, description } = body;

    // Create task
    const { error } = await supabase
      .from('tasks')
      .insert({
        level_id,
        title,
        description,
        status: 'active',
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
