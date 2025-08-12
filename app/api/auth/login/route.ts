import { NextResponse } from 'next/server'
import { comparePasswords, createSession, setSessionCookie } from '@/utils/auth'
import { getUserByPhone } from '@/utils/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user by phone
    const user = await getUserByPhone(phone)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await comparePasswords(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session token
    const token = await createSession(user.id)
    
    // Set session cookie
    await setSessionCookie(token)

    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
} 