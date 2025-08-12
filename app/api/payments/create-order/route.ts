import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { requireAuth } from '@/utils/auth'
import { createOrder } from '@/utils/razorpay'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    // Authenticate user
    const userId = await requireAuth()

    // Get affiliate code from cookie
    const cookieStore = await cookies()
    const affiliateCode = cookieStore.get('affiliate_code')?.value

    const supabase = createClient()

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('phone, name, email')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create order with Razorpay
    const order = await createOrder({
      amount: 899 * 100, // Convert to paise
      receipt: `order_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`,
      notes: {
        userId,
        affiliateCode: affiliateCode || ''
      }
    })

    // If there's an affiliate code, get affiliate details
    let affiliateId: string | null = null
    if (affiliateCode) {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('affiliate_code', affiliateCode)
        .eq('status', 'active')
        .single()

      if (affiliate) {
        affiliateId = affiliate.id
      }
    }

    // Store order details in database
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        razorpay_order_id: order.id,
        amount: 899,
        status: 'pending',
        affiliate_id: affiliateId
      })

    if (orderError) {
      console.error('Error storing order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      userDetails: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
} 