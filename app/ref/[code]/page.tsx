'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RefPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const router = useRouter()

  useEffect(() => {
    const recordVisit = async () => {
      try {
        // Record the visit
        const response = await fetch('/api/affiliate/record-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ affiliate_code: code })
        })

        if (!response.ok) {
          console.error('Failed to record affiliate visit')
          return
        }

        const data = await response.json()
        
        // Store affiliate ID in localStorage
        if (data.affiliate_id) {
          localStorage.setItem('affiliate_id', data.affiliate_id)
          localStorage.setItem('affiliate_timestamp', Date.now().toString())
        }

        // Redirect to home page
        router.push('/')
      } catch (error) {
        console.error('Error recording visit:', error)
        router.push('/')
      }
    }

    recordVisit()
  }, [code, router])

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white">
      {/* Centered loading spinner for mobile */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
} 