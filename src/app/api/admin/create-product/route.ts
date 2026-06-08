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
    const price = formData.get('price') as string
    const imageFile = formData.get('image') as File | null

    if (!title) {
      return NextResponse.json(
        { error: 'Product title is required' },
        { status: 400 }
      )
    }

    let imageUrl: string | null = null

    if (imageFile) {
      try {
        const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        imageUrl = data.publicUrl
      } catch (uploadErr) {
        console.error('Image upload failed:', uploadErr)
      }
    }

    // Insert product directly into products table
    const { data: insertData, error } = await supabase
      .from('products')
      .insert([
        {
          title,
          description,
          image_url: imageUrl,
          price: price ? parseFloat(price) : null,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      product: insertData?.[0],
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    )
  }
}
