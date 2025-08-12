'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Raleway } from 'next/font/google'

const raleway = Raleway({ subsets: ['latin'] })

export default function PaymentSuccess() {
  const router = useRouter()

  useEffect(() => {
    // Check if user came from payment
    const purchaseIntent = localStorage.getItem('purchaseIntent')
    if (!purchaseIntent) {
      router.push('/')
    }
  }, [router])

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${raleway.className}`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <span className="text-blue-600 font-bold text-2xl" style={{ fontFamily: 'inherit' }}>
            eamcet<span className="text-gray-900" style={{ fontFamily: 'inherit' }}>pro</span>
          </span>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-lg sm:px-10 border border-gray-100 text-center" style={{ fontFamily: 'inherit' }}>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'inherit' }}>
            Payment Successful!
          </h2>
          
          <p className="text-gray-600 mb-6" style={{ fontFamily: 'inherit' }}>
            Thank you for subscribing to EamcetPro Premium. Your account has been upgraded.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{ fontFamily: 'inherit' }}
            >
              Go to Dashboard
            </Link>
            
            <Link
              href="/support"
              className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{ fontFamily: 'inherit' }}
            >
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 