import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();
    const { email, password } = body;

    // Normalize email
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Verify credentials against Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isAdminEmail = normalizedEmail === 'papasupe85@gmail.com' || normalizedEmail === 'hebronjesuloba@gmail.com';

    // Check if user exists in users table
    const { data: userProfile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', data.user.id)
      .maybeSingle();

    const isAdminUser = userProfile?.is_admin === true;

    console.log('Admin login attempt:', { normalizedEmail, isAdminEmail, isAdminUser, userProfile });

    if (!isAdminEmail && !isAdminUser) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 });
    }

    // If user doesn't exist in users table, create them as admin
    if (!userProfile) {
      await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: normalizedEmail,
          is_admin: true,
          is_activated: true,
        });
    } 
    // If user exists but not admin, set them as admin if they're admin email
    else if (isAdminEmail && !isAdminUser) {
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
