import crypto from 'crypto'
import Razorpay from 'razorpay'


// Add type declarations


declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RAZORPAY_KEY_ID: string
      RAZORPAY_KEY_SECRET: string
      NEXT_PUBLIC_RAZORPAY_KEY_ID: string
    }
  }
}

export const PLAN_AMOUNT = 900 * 100 // ₹900 in paise

// Debug: Log environment variables during build
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID)
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '***SET***' : '***NOT SET***')

// Initialize Razorpay only on the server side
let razorpay: any = null
if (typeof window === 'undefined') {
  // Use fallback values for build time to prevent build failures
  const keyId = process.env.RAZORPAY_KEY_ID || 'dummy_key_id_for_build'
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret_for_build'
  
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  })
}

interface OrderParams {
  amount: number
  receipt: string
  notes?: Record<string, string>
}

interface RazorpayOrder {
  id: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: string
  attempts: number
  notes: Record<string, string>
  created_at: number
}

export async function createOrder(params: OrderParams): Promise<RazorpayOrder> {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Missing Razorpay credentials')
    }

    const order = await razorpay.orders.create({
      amount: params.amount,
      currency: 'INR',
      receipt: params.receipt,
      notes: params.notes,
    })

    return order
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    throw new Error('Failed to create order')
  }
}

export function verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      throw new Error('Missing Razorpay secret key')
    }

    const text = `${orderId}|${paymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('Payment verification error:', error)
    return false
  }
}

// Client-side configuration
export const RAZORPAY_CONFIG = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  currency: 'INR',
  amount: PLAN_AMOUNT,
  name: 'EamcetPro',
  description: 'EamcetPro Premium Subscription',
  theme: {
    color: '#2d99f1ba'
  }
}

export function getRazorpayConfig() {
  return {
    key: process.env.RAZORPAY_KEY_ID,
  }
} 