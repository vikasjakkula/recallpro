import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '../../../../utils/supabase/server'
import { sendOTP } from '@/utils/otp'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, college, email, phone, alt_phone, password } = body

    // Check for required fields
    if (!name || !college || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`phone.eq.${phone}`)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this phone number or email. Please login instead.' },
        { status: 400 }
      )
    }

    // Send OTP
    const { verificationId, error: otpError } = await sendOTP(phone)
    if (otpError) {
      return NextResponse.json({ error: otpError }, { status: 400 })
    }

    // Create response with verification ID and set cookie in one go
    const response = NextResponse.json({ success: true, verificationId })

    // Set cookie for pending registration
    const cookieStore = await cookies()
    cookieStore.set('pending_registration', JSON.stringify(body), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
} 