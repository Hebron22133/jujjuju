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
      // Use level parameter
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

    // Update user level and balance
    const { error } = await supabase
      .from('users')
      .update({ 
        level_id: actualLevel,
        tier_level: actualLevel,
        balance: balance
      })
      .eq('id', user_id)

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      message: `Agent updated to Level ${actualLevel} with balance ₦${balance.toLocaleString()}`
    })
  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
