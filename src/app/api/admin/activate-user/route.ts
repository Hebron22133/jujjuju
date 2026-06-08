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
    const { user_id, level, amount } = body

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Use custom amount if provided, otherwise use level mapping
    let balance: number
    let actualLevel: number

    if (amount !== undefined && amount !== null) {
      // Custom amount provided by admin
      balance = parseFloat(amount)
      
      // Determine level based on amount
      if (balance >= 200000) actualLevel = 5
      else if (balance >= 100000) actualLevel = 4
      else if (balance >= 50000) actualLevel = 3
      else if (balance >= 10000) actualLevel = 2
      else actualLevel = 1
    } else {
      // Use level mapping
      const levelConfig: { [key: number]: number } = {
        1: 4000,
        2: 10000,
        3: 50000,
        4: 100000,
        5: 200000
      }
      
      actualLevel = level || 1
      balance = levelConfig[actualLevel] || 4000
    }

    // Update user activation status and set balance based on amount or level
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_activated: true,
        balance: balance,
        tier_level: actualLevel,
        level_id: actualLevel
      })
      .eq('id', user_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create user progress record for the level
    const { error: progressError } = await supabase
      .from('user_progress')
      .insert({
        user_id: user_id,
        level_id: actualLevel,
        start_date: new Date().toISOString(),
        days_completed: 0,
        total_earned: 0
      })

    // Don't fail if progress record already exists
    if (progressError && !progressError.message.includes('duplicate')) {
      console.error('Progress record error:', progressError)
    }

    return NextResponse.json({ 
      success: true,
      message: `User activated at Level ${actualLevel} with balance ₦${balance.toLocaleString()}`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
