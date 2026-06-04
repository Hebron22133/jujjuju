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
    const { user_id, level_id } = body;

    // Call activate function
    const { data, error } = await supabase.rpc('admin_activate_user', {
      p_user_id: user_id,
      p_level_id: level_id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
