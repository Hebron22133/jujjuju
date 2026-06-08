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
    // Get all levels with current amounts
    const { data: levels, error } = await supabase
      .from('levels')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ levels: levels || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Service not available' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { level_id, task_access_amount, daily_commission, entry_amount } = body

    if (!level_id || task_access_amount === undefined) {
      return NextResponse.json(
        { error: 'Level ID and task_access_amount are required' },
        { status: 400 }
      )
    }

    // Update the level
    const { data, error: updateError } = await supabase
      .from('levels')
      .update({
        task_access_amount,
        ...(daily_commission !== undefined && { daily_commission }),
        ...(entry_amount !== undefined && { entry_amount })
      })
      .eq('id', level_id)
      .select()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // If task_access_amount changed, update all users at this level
    if (task_access_amount !== undefined) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ balance: task_access_amount })
        .eq('level_id', level_id)
        .eq('is_activated', true)

      if (userUpdateError) {
        console.error('Error updating user balances:', userUpdateError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Level ${level_id} updated successfully`,
      level: data?.[0]
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
