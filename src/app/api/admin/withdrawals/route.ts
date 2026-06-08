import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Service not available' }, { status: 503 })
  }
  try {
    // Get all withdrawals with user email
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select(
        `
        id,
        user_id,
        amount,
        status,
        created_at,
        users:user_id(email)
      `
      )
      .order('created_at', { ascending: false })

    if (withdrawalsError) throw withdrawalsError

    // Format the response
    const formattedWithdrawals = (withdrawals || []).map((w: any) => ({
      id: w.id,
      user_id: w.user_id,
      amount: w.amount,
      status: w.status,
      created_at: w.created_at,
      user_email: w.users?.email || 'N/A',
    }))

    return NextResponse.json({
      withdrawals: formattedWithdrawals,
    })
  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 })
  }
}
