import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { requireAuth } from '@/utils/auth'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    // Authenticate user
    const userId = await requireAuth()
    
    // Get request body
    const body = await request.json()
    const { paymentMethod, upiId, accountNumber, ifscCode } = body

    // Validate payment details
    if (paymentMethod === 'upi' && !upiId) {
      return NextResponse.json({ error: 'UPI ID is required' }, { status: 400 })
    }
    if (paymentMethod === 'bank' && (!accountNumber || !ifscCode)) {
      return NextResponse.json({ error: 'Account number and IFSC code are required' }, { status: 400 })
    }

    const supabase = createClient()

    // Check if user is already an affiliate
    const { data: existingAffiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingAffiliate) {
      return NextResponse.json({ error: 'You are already registered as an affiliate' }, { status: 400 })
    }

    // Generate unique affiliate code
    const affiliateCode = nanoid(8)

    // Prepare payment details based on payment method
    const paymentDetails = paymentMethod === 'upi'
      ? { upi_id: upiId }
      : { account_number: accountNumber, ifsc_code: ifscCode }

    // Insert affiliate record
    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .insert({
        user_id: userId,
        affiliate_code: affiliateCode,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: 'active',
        terms_accepted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating affiliate:', error)
      return NextResponse.json({ error: 'Failed to create affiliate account' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Affiliate registration successful',
      affiliateCode
    })

  } catch (error) {
    console.error('Error in affiliate registration:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 