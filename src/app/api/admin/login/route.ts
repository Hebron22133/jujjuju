import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['papasupe85@gmail.com', 'hebronjesuloba@gmail.com'];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();
    const { email, password } = body;

    // Normalize email
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Check if email is admin
    const isAdminEmail = ADMIN_EMAILS.some(
      adminEmail => normalizedEmail === adminEmail.toLowerCase()
    );

    if (!isAdminEmail) {
      return NextResponse.json({ error: 'Not an admin email' }, { status: 403 });
    }

    // Verify credentials against Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Ensure user exists in users table and is marked as admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!userProfile) {
      // Create user as admin
      await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: normalizedEmail,
          is_admin: true,
          is_activated: true,
        });
    } else {
      // Ensure existing user is marked as admin
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
