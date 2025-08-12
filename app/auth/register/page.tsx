'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Raleway } from 'next/font/google'

const raleway = Raleway({ subsets: ['latin'] })

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    email: '',
    phone: '',
    alt_phone: '',
    password: ''
  })
  const [verificationId, setVerificationId] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone' | 'alt_phone') => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setVerificationId(data.verificationId)
      setStep('otp')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Get redirect path from localStorage if exists
      const redirectPath = localStorage.getItem('redirectPath')

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId,
          code: otp,
          phone: formData.phone,
          redirectPath // Include redirect path in request
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed')
      }

      // Clear redirectPath from localStorage
      localStorage.removeItem('redirectPath')

      // Redirect to the specified path or dashboard
      router.push(data.redirectPath || '/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${raleway.className}`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
        <img
            src="/recallpro.png"
            alt="RecallPro Logo"
            className="h-16 w-auto mx-auto"
            style={{ maxWidth: 180, height: 'auto', fontFamily: 'Raleway, sans-serif' }}
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
          {step === 'details' ? 'Create your account' : 'Verify your phone'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600" style={{ fontFamily: 'Raleway, sans-serif' }}>
          {step === 'details' ? (
            <>
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Sign in
              </Link>
            </>
          ) : (
            'Enter the OTP sent to your phone'
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-lg sm:px-10 border border-gray-100" style={{ fontFamily: 'Raleway, sans-serif' }}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 font-medium text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>
              {error}
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleSubmit} className="space-y-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="college" className="block text-sm font-medium text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  College Name
                </label>
                <input
                  id="college"
                  name="college"
                  type="text"
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e, 'phone')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  maxLength={10}
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                />
                <p className="mt-1 text-sm text-gray-500" style={{ fontFamily: 'Raleway, sans-serif' }}>Please enter a valid 10-digit phone number</p>
              </div>

              <div>
                <label htmlFor="alt_phone" className="block text-sm font-medium text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Alternative Phone Number (Optional)
                </label>
                <input
                  id="alt_phone"
                  name="alt_phone"
                  type="tel"
                  value={formData.alt_phone}
                  onChange={(e) => handlePhoneChange(e, 'alt_phone')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  maxLength={10}
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || formData.phone.length !== 10}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Enter OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="• • • •"
                  maxLength={4}
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                />
                <p className="mt-2 text-sm text-gray-500 text-center" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  We've sent a 4-digit OTP to your phone number
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 4}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 