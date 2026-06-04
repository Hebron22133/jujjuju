import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();
    const { email, key } = body;

    // Check if key is "Q"
    if (key !== 'Q') {
      return NextResponse.json({ error: 'Invalid key. Enter Q' }, { status: 401 });
    }

    // Normalize email
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Get or create admin user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, is_admin')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      // User exists, ensure admin flag is set
      await supabase
        .from('users')
        .update({ is_admin: true, is_activated: true })
        .eq('id', existingUser.id);

      return NextResponse.json({
        success: true,
        token: 'admin_token_' + existingUser.id,
        user: { id: existingUser.id, email: normalizedEmail },
      });
    } else {
      // Try to create user if they exist in auth
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(existingUser?.id || '');
      
      if (authUser) {
        await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: normalizedEmail,
            is_admin: true,
            is_activated: true,
          })
          .select()
          .single();

        return NextResponse.json({
          success: true,
          token: 'admin_token_' + authUser.id,
          user: { id: authUser.id, email: normalizedEmail },
        });
      } else {
        // User doesn't exist anywhere, just allow with email
        return NextResponse.json({
          success: true,
          token: 'admin_token_' + normalizedEmail,
          user: { email: normalizedEmail },
        });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
