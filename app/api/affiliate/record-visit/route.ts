import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { affiliate_code, user_id } = body

    if (!affiliate_code) {
      return NextResponse.json(
        { error: 'Affiliate code is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get affiliate ID from the code
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliate_code)
      .single()

    if (affiliateError || !affiliate) {
      console.error('Invalid affiliate code:', affiliate_code)
      return NextResponse.json(
        { error: 'Invalid affiliate code' },
        { status: 400 }
      )
    }

    // Record the visit
    const { error: visitError } = await supabase
      .from('affiliate_visits')
      .insert({
        affiliate_id: affiliate.id,
        user_id: user_id || null,
        visitor_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        referrer: request.headers.get('referer') || null,
        user_agent: request.headers.get('user-agent') || null
      })

    if (visitError) {
      console.error('Error recording affiliate visit:', visitError)
      return NextResponse.json(
        { error: 'Failed to record visit' },
        { status: 500 }
      )
    }

    // Create response with affiliate ID
    const response = NextResponse.json({ 
      success: true,
      affiliate_id: affiliate.id
    })

    // Set cookie that expires in 30 days
    response.cookies.set('affiliate_id', affiliate.id, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      path: '/',
      secure: true,
      sameSite: 'lax'
    })

    return response
  } catch (error) {
    console.error('Error in record-visit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 