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
    const formData = await req.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const amount = parseFloat(formData.get('amount') as string)
    const commissionRate = parseFloat(formData.get('commissionRate') as string) || 1.2
    const priority = formData.get('priority') as string
    const levelId = parseInt(formData.get('levelId') as string) || null
    const imageFile = formData.get('image') as File | null

    if (!title || !amount) {
      return NextResponse.json(
        { error: 'Title and amount are required' },
        { status: 400 }
      )
    }

    if (!levelId) {
      return NextResponse.json(
        { error: 'Level is required for task assignment' },
        { status: 400 }
      )
    }

    let imageUrl: string | null = null

    if (imageFile) {
      try {
        const fileName = `task-${Date.now()}-${Math.random().toString(36).substring(7)}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('task-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('task-images')
          .getPublicUrl(fileName)

        imageUrl = data.publicUrl
      } catch (uploadErr) {
        console.error('Image upload failed:', uploadErr)
      }
    }

    // Insert task with level assignment
    const { data: insertData, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          description,
          image_url: imageUrl,
          amount,
          commission_rate: commissionRate,
          status: 'assigned', // Set to assigned since it's for a specific level
          priority,
          level_id: levelId,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `Task created and assigned to Level ${levelId}`,
      task: insertData?.[0],
    })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create task' },
      { status: 500 }
    )
  }
}
