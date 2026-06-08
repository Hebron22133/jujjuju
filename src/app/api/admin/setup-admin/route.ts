import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { adminEmail } = await req.json();

    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email required' }, { status: 400 });
    }

    // Update ALL users with this email to be admin
    const { error } = await supabase
      .from('users')
      .update({ is_admin: true, is_activated: true })
      .ilike('email', adminEmail);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Set ${adminEmail} as admin` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
