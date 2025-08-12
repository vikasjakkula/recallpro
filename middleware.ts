import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Add paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-otp'
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path is public
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }

  // Check for static files and API routes that don't need auth
  if (
    path.startsWith('/_next') || // Static files
    path.startsWith('/favicon.ico') ||
    path === '/' // Homepage
  ) {
    return NextResponse.next()
  }

  // Check if path requires authentication
  if (path.startsWith('/payment') || path.startsWith('/api/test/submit')) {
    const token = request.cookies.get('session')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    } catch (error) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  try {
    // Get affiliate code from query parameter
    const { searchParams } = new URL(request.url)
    const affiliateCode = searchParams.get('ref')

    // If no affiliate code, continue without modification
    if (!affiliateCode) {
      return NextResponse.next()
    }

    // Create a new supabase client
    const supabase = createClient(request)

    // Check if affiliate code is valid
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliateCode)
      .eq('status', 'active')
      .single()

    if (!affiliate) {
      return NextResponse.next()
    }

    // Get visitor's IP address from headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const visitorIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'

    // Record the visit
    await supabase
      .from('affiliate_visits')
      .insert({
        affiliate_id: affiliate.id,
        visitor_ip: visitorIp,
        referrer: request.headers.get('referer') || null,
        user_agent: request.headers.get('user-agent') || null,
        utm_source: searchParams.get('utm_source') || null,
        utm_medium: searchParams.get('utm_medium') || null,
        utm_campaign: searchParams.get('utm_campaign') || null
      })
      .select()

    // Create response and set affiliate cookie
    const response = NextResponse.next()
    
    // Set affiliate cookie with 30-day expiry
    response.cookies.set('affiliate_code', affiliateCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Error in affiliate tracking:', error)
    return NextResponse.next()
  }
}

// Only run middleware on homepage and payment routes
export const config = {
  matcher: ['/', '/payment/:path*']
} 