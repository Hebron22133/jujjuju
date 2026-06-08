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
      return NextResponse.json({ error: 'Task ID and User ID required' }, { status: 400 })
    }

    console.log(`[process-task] Processing task ${task_id} for user ${user_id}`)

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', task_id)
      .single()

    if (taskError || !task) {
      console.error(`[process-task] Task not found:`, taskError)
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.status === 'completed') {
      return NextResponse.json({ error: 'Task already completed' }, { status: 400 })
    }

    // Calculate commission
    const commission = Math.round(task.amount * (task.commission_rate / 100) * 100) / 100

    console.log(`[process-task] Task: ${task.title}, Amount: ${task.amount}, Commission: ${commission}`)

    // Update task status to completed
    const { error: updateTaskError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', task_id)

    if (updateTaskError) {
      console.error(`[process-task] Failed to update task:`, updateTaskError)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 400 })
    }

    // Get current user balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', user_id)
      .single()

    if (userError || !userData) {
      console.error(`[process-task] User not found:`, userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const newBalance = userData.balance + commission

    console.log(`[process-task] Updating balance from ${userData.balance} to ${newBalance}`)

    // Update user balance
    const { error: updateBalanceError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', user_id)

    if (updateBalanceError) {
      console.error(`[process-task] Failed to update balance:`, updateBalanceError)
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 400 })
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id,
        type: 'order_commission',
        amount: commission,
        status: 'completed'
      })

    if (transactionError) {
      console.error('[process-task] Transaction record error:', transactionError)
      // Don't fail - task is still completed
    }

    console.log(`[process-task] Task completed successfully. Commission: ${commission}, New balance: ${newBalance}`)

    return NextResponse.json({
      success: true,
      message: 'Task completed successfully',
      commission,
      newBalance,
      task: {
        id: task.id,
        title: task.title,
        amount: task.amount,
        commission_rate: task.commission_rate
      }
    })
  } catch (error: any) {
    console.error('[process-task] Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
