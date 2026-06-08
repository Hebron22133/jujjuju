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
    const { user_id, bank_code, bank_name, account_number, account_holder_name } = body

    if (!user_id || !bank_code || !bank_name || !account_number) {
      return NextResponse.json({ 
        error: 'Missing required fields: user_id, bank_code, bank_name, account_number' 
      }, { status: 400 })
    }

    // Validate account number format (Nigerian bank account = 10 digits)
    if (!/^\d{10}$/.test(account_number)) {
      return NextResponse.json({ 
        error: 'Invalid account number. Nigerian account numbers must be 10 digits.' 
      }, { status: 400 })
    }

    // Update user bank info
    const { error: updateError } = await supabase
      .from('users')
      .update({
        bank_code,
        bank_name,
        account_number,
        account_holder_name: account_holder_name || null,
        bank_updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (updateError) {
      console.error('Bank info update error:', updateError)
      return NextResponse.json({ error: 'Failed to update bank info' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Bank account info updated successfully',
      bank: {
        bank_code,
        bank_name,
        account_number,
        account_holder_name
      }
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
