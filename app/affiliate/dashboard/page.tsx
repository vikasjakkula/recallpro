'use client'

import { useState, useEffect } from 'react'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/navigation'
import { 
  ClipboardDocumentIcon, 
  ClipboardDocumentCheckIcon,
  EyeIcon,
  CurrencyRupeeIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'

const inter = Inter({ subsets: ['latin'] })

interface Stats {
  totalVisits: number
  totalSales: number
  totalCommission: number
}

export default function AffiliateDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [affiliateCode, setAffiliateCode] = useState('')
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    totalSales: 0,
    totalCommission: 0
  })
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetchAffiliateDetails()
  }, [])

  const fetchAffiliateDetails = async () => {
    try {
      const response = await fetch('/api/affiliate/details')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch affiliate details')
      }

      setAffiliateCode(data.affiliateCode)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching affiliate details:', error)
      setError(error instanceof Error ? error.message : 'Failed to load affiliate details')
      // If not registered as affiliate, redirect to registration
      if ((error as any)?.message?.includes('not registered')) {
        router.push('/affiliate/register')
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      const affiliateLink = `${window.location.origin}/?ref=${affiliateCode}`
      await navigator.clipboard.writeText(affiliateLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex flex-col items-center justify-center ${inter.className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 ${inter.className}`}>
        <div className="text-red-600 text-center">{error}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex justify-center sm:justify-start">
            <span className="text-blue-600 font-bold text-2xl">eamcet<span className="text-gray-900">pro</span></span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center sm:text-left">
            Affiliate Dashboard
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:py-8 sm:px-6">
        {/* Affiliate Link Section */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
          <div className="w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClipboardDocumentIcon className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
              Your Affiliate Link
            </h2>
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
              <div className="flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    value={`${window.location.origin}/?ref=${affiliateCode}`}
                    readOnly
                    className="block w-full rounded-xl border border-gray-300 py-3.5 px-4 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gray-50"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 active:scale-95 transform"
              >
                {copySuccess ? (
                  <>
                    <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-500 flex items-center">
              <CurrencyRupeeIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              Share this link to earn ₹180 commission for each successful referral
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="space-y-4 sm:space-y-0 grid grid-cols-1 sm:grid-cols-3 sm:gap-6">
          {/* Total Visits */}
          <div className="bg-white overflow-hidden rounded-xl shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-xl bg-blue-100 p-3">
                  <EyeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500">Total Visits</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {stats.totalVisits.toLocaleString()}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm text-gray-500">
                Number of people who clicked your link
              </div>
            </div>
          </div>

          {/* Total Sales */}
          <div className="bg-white overflow-hidden rounded-xl shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-xl bg-green-100 p-3">
                  <ShoppingCartIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500">Total Sales</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {stats.totalSales.toLocaleString()}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm text-gray-500">
                Number of successful purchases
              </div>
            </div>
          </div>

          {/* Total Commission */}
          <div className="bg-white overflow-hidden rounded-xl shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-xl bg-yellow-100 p-3">
                  <CurrencyRupeeIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500">Total Commission</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    ₹{(stats.totalCommission / 100).toLocaleString('en-IN', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm text-gray-500">
                Total earnings from referrals
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 