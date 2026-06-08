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
    const { task_id, user_id } = body

    if (!task_id || !user_id) {
      return NextResponse.json({ error: 'task_id and user_id are required' }, { status: 400 })
    }

    // Update task with assigned_to and change status to assigned
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        assigned_to: user_id,
        status: 'assigned'
      })
      .eq('id', task_id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Task assigned successfully',
      task: data[0]
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
