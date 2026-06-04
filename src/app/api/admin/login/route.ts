import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();
    const { email, password } = body;

    // Verify credentials against Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if user is admin (allow papasupe85@gmail.com or is_admin = true)
    const { data: userProfile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', data.user.id)
      .maybeSingle();

    const isAdminEmail = email === 'papasupe85@gmail.com';
    const isAdminUser = userProfile?.is_admin === true;

    if (!isAdminEmail && !isAdminUser) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 });
    }

    // If admin email but profile doesn't have is_admin flag, set it now
    if (isAdminEmail && !isAdminUser) {
      await supabase
        .from('users')
        .update({ is_admin: true, is_activated: true })
        .eq('id', data.user.id);
    }

    // Return session token
    return NextResponse.json({
      success: true,
      token: data.session?.access_token,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
