import { NextResponse } from 'next/server'
import { requireAuth } from '@/utils/auth'
import { verifyPayment } from '@/utils/razorpay'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const userId = await requireAuth()

    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    console.log('Verifying payment:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature?.slice(0, 10) + '...' // Log partial signature for security
    })

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('Missing payment details:', { body })
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if (!isValid) {
      console.error('Invalid payment signature')
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, amount')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (orderError) {
      console.error('Error fetching order:', orderError)
      return NextResponse.json(
        { error: 'Failed to fetch order details' },
        { status: 500 }
      )
    }

    if (!order) {
      console.error('Order not found:', razorpay_order_id)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify order belongs to authenticated user
    if (order.user_id !== userId) {
      console.error('Order user mismatch:', {
        orderId: order.id,
        orderUserId: order.user_id,
        authenticatedUserId: userId
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get affiliate ID from cookie
    const cookieStore = await cookies()
    const affiliateId = cookieStore.get('affiliate_id')?.value

    console.log('Processing payment for order:', {
      orderId: order.id,
      amount: order.amount,
      affiliateId: affiliateId || 'none'
    })

    // Start a transaction to update order and create commission
    const { error: transactionError } = await supabase.rpc('handle_successful_payment', {
      p_order_id: order.id,
      p_payment_id: razorpay_payment_id,
      p_affiliate_id: affiliateId || null,
      p_commission_amount: affiliateId ? Math.floor(order.amount * 0.2) : 0
    })

    if (transactionError) {
      console.error('Error processing payment:', transactionError)
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      )
    }

    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: 'Payment verified successfully'
    })

    // Clear affiliate cookies
    response.cookies.delete('affiliate_id')

    console.log('Payment processed successfully:', {
      orderId: order.id,
      paymentId: razorpay_payment_id,
      affiliateId: affiliateId || 'none'
    })

    return response
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify payment' },
      { status: 500 }
    )
  }
} 