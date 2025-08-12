import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyOTP } from '@/utils/otp'
import { createUser } from '@/utils/supabase'
import { createSession } from '@/utils/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { verificationId, code, phone, redirectPath } = body

    if (!verificationId || !code || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify OTP
    const verifyResult = await verifyOTP(phone, verificationId, code)
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error },
        { status: 400 }
      )
    }

    // Get pending registration data from cookies
    const cookieStore = await cookies()
    const pendingRegistrationValue = cookieStore.get('pending_registration')?.value
    
    if (!pendingRegistrationValue) {
      return NextResponse.json(
        { error: 'Registration session expired' },
        { status: 400 }
      )
    }

    // Parse user data from cookie
    const userData = JSON.parse(pendingRegistrationValue)
    
    // Create user in database
    const user = await createUser(userData)
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create session
    const token = await createSession(user.id)

    // Create response and set cookies in one go
    return new NextResponse(
      JSON.stringify({ 
        success: true,
        redirectPath: redirectPath || '/dashboard' // Include the redirect path in response
      }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': [
            `session=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax`,
            'pending_registration=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax' // Clear the registration cookie
          ].join(', ')
        }
      }
    )
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
} 