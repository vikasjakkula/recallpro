import { NextResponse } from 'next/server'
import { requireAuth } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    // Verify user is authenticated
    const userId = await requireAuth()

    // Get user details from database
    const supabase = createClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, email')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user details' },
      { status: 500 }
    )
  }
} 