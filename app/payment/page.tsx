'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Raleway } from 'next/font/google'
import { RAZORPAY_CONFIG } from '@/utils/razorpay'

const raleway = Raleway({ subsets: ['latin'] })

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function Payment() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userPhone, setUserPhone] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check-session')
        const data = await response.json()

        if (!data.authenticated) {
          // Store current path before redirecting
          localStorage.setItem('redirectPath', '/payment')
          router.push('/auth/login')
          return
        }

        // Get user details including phone
        const userResponse = await fetch('/api/auth/user')
        const userData = await userResponse.json()
        setUserPhone(userData.phone || '')

        setIsAuthenticated(true)
        
        // Load Razorpay script only if authenticated
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => setLoading(false)
        document.body.appendChild(script)
      } catch (error) {
        console.error('Auth error:', error)
        setError('Authentication failed')
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handlePayment = async () => {
    if (!isAuthenticated) {
      setError('Please log in to continue')
      return
    }

    try {
      setError('')
      setLoading(true)

      // Get order ID from backend
      const response = await fetch('/api/payments/create-order', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: RAZORPAY_CONFIG.amount,
        currency: RAZORPAY_CONFIG.currency,
        name: RAZORPAY_CONFIG.name,
        description: RAZORPAY_CONFIG.description,
        order_id: data.orderId,
        theme: RAZORPAY_CONFIG.theme,
        prefill: {
          name: 'Student',
          contact: userPhone,
          email: ''
        },
        handler: async (response: any) => {
          try {
            console.log('Payment response:', response) // Add this for debugging
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            })

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed')
            }

            // Clear purchase intent and redirect to success page
            localStorage.removeItem('purchaseIntent')
            router.push('/payment/success')
          } catch (error) {
            console.error('Payment verification error:', error)
            setError('Payment verification failed')
            setLoading(false)
            // Redirect to failure page on verification error
            router.push('/payment/failure')
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          }
        }
      }

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : 'Payment failed')
      setLoading(false)
    }
  }

  // Loading skeleton
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${raleway.className}`} style={{ fontFamily: 'inherit' }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="mt-6 text-center">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-lg sm:px-10 border border-gray-100" style={{ fontFamily: 'inherit' }}>
            <div className="space-y-6">
              <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${raleway.className}`} style={{ fontFamily: 'inherit' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <span className="text-blue-600 font-bold text-2xl" style={{ fontFamily: 'inherit' }}>eamcet<span className="text-gray-900" style={{ fontFamily: 'inherit' }}>pro</span></span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'inherit' }}>
          Complete Your Purchase
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-lg sm:px-10 border border-gray-100" style={{ fontFamily: 'inherit' }}>
          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 rounded-md mb-4 text-sm text-red-700" style={{ fontFamily: 'inherit' }}>
              {error}
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium text-gray-900" style={{ fontFamily: 'inherit' }}>Order Summary</h3>
            <div className="mt-4 bg-gray-50 rounded-lg p-4" style={{ fontFamily: 'inherit' }}>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600" style={{ fontFamily: 'inherit' }}>Complete Test Series Package</span>
                <span className="font-medium text-gray-900" style={{ fontFamily: 'inherit' }}>₹900</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between font-medium">
                <span className='text-gray-600' style={{ fontFamily: 'inherit' }}>Total</span>
                <span className='text-blue-600' style={{ fontFamily: 'inherit' }}>₹900</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'inherit' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-5" />
            <p className="text-xs text-gray-500" style={{ fontFamily: 'inherit' }}>Secure payment by Razorpay</p>
          </div>
        </div>
      </div>
    </div>
  )
} 