import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Service not available' }, { status: 503 })
  }
  try {
    const body = await req.json()
    const { withdrawal_id } = body

    if (!withdrawal_id) {
      return NextResponse.json({ error: 'Withdrawal ID is required' }, { status: 400 })
    }

    // Call review function with 'approved' status
    const { data, error } = await supabase.rpc('admin_review_withdrawal', {
      p_withdrawal_id: withdrawal_id,
      p_status: 'approved',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
