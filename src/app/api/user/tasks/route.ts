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
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's level
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('level_id, tier_level')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Use level_id if available, fallback to tier_level
    const userLevel = user.level_id || user.tier_level

    if (!userLevel) {
      // User has no level assigned
      return NextResponse.json({ tasks: [] })
    }

    // Get tasks for the user's level
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('level_id', userLevel)
      .order('created_at', { ascending: false })

    if (tasksError) {
      console.error('Tasks error:', tasksError)
      // If level_id column doesn't exist, return empty array
      if (tasksError.message?.includes('column')) {
        return NextResponse.json({ tasks: [] })
      }
      return NextResponse.json({ error: tasksError.message }, { status: 400 })
    }

    return NextResponse.json({ tasks: tasks || [] })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
