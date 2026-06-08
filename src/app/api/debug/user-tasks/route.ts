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
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, level_id, tier_level, balance, is_activated')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found', userError }, { status: 404 })
    }

    // Get all tasks in database
    const { data: allTasks, error: allTasksError } = await supabase
      .from('tasks')
      .select('id, title, level_id, status')

    if (allTasksError) {
      console.error('All tasks error:', allTasksError)
    }

    // Get tasks for user's level
    const userLevel = user.level_id || user.tier_level
    const { data: userTasks, error: userTasksError } = await supabase
      .from('tasks')
      .select('id, title, level_id, status')
      .eq('level_id', userLevel)

    if (userTasksError) {
      console.error('User tasks error:', userTasksError)
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        level_id: user.level_id,
        tier_level: user.tier_level,
        balance: user.balance,
        is_activated: user.is_activated,
        effectiveLevel: userLevel
      },
      allTasksCount: allTasks?.length || 0,
      allTasks: allTasks || [],
      userTasksCount: userTasks?.length || 0,
      userTasks: userTasks || [],
      errors: {
        allTasksError,
        userTasksError
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
