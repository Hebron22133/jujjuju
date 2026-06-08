import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, key } = body;

    // Check if key is "Q"
    if (key !== 'Q') {
      return NextResponse.json({ error: 'Invalid key. Enter Q' }, { status: 401 });
    }

    // Check if email is provided
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Success - return token
    const normalizedEmail = email.toLowerCase().trim();
    return NextResponse.json({
      success: true,
      token: 'admin_token_' + Date.now(),
      user: { email: normalizedEmail },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
