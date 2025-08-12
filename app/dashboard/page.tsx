"use client"

import { useState, useEffect } from 'react'
import { Raleway } from 'next/font/google'
import { 
  HomeIcon, 
  BookOpenIcon, 
  ChartBarIcon, 
  UserIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Font configuration
const raleway = Raleway({ subsets: ['latin'] })

// Mock data
const recentTests = [
  { id: 1, name: 'TS EAMCET 2023 - Set A', score: 125, total: 160, completed: true, date: '2023-12-05' },
  { id: 2, name: 'TS EAMCET 2023 - Set B', score: 138, total: 160, completed: true, date: '2023-12-10' },
  { id: 3, name: 'Mock Test #3', score: 145, total: 160, completed: true, date: '2023-12-15' },
  { id: 4, name: 'AP EAMCET 2023 - Set A', score: null, total: 160, completed: false, date: 'In progress' },
]

const allTestSeries = [
  { 
    year: '2023',
    tests: [
      { id: 101, name: 'TS EAMCET 2023 - Set A', completed: true, score: 125 },
      { id: 102, name: 'TS EAMCET 2023 - Set B', completed: true, score: 138 },
      { id: 103, name: 'AP EAMCET 2023 - Set A', completed: false },
      { id: 104, name: 'AP EAMCET 2023 - Set B', completed: false },
    ]
  },
  { 
    year: '2022',
    tests: [
      { id: 201, name: 'TS EAMCET 2022 - Set A', completed: false },
      { id: 202, name: 'TS EAMCET 2022 - Set B', completed: false },
      { id: 203, name: 'AP EAMCET 2022 - Set A', completed: false },
      { id: 204, name: 'AP EAMCET 2022 - Set B', completed: false },
    ]
  },
  { 
    year: 'Mock Tests',
    tests: [
      { id: 301, name: 'Full Length Mock Test #1', completed: true, score: 142 },
      { id: 302, name: 'Full Length Mock Test #2', completed: true, score: 150 },
      { id: 303, name: 'Full Length Mock Test #3', completed: false },
      { id: 304, name: 'Full Length Mock Test #4', completed: false },
    ]
  }
]

const subjectPerformance = [
  { subject: 'Mathematics', score: 72, trend: 'up', questions: 80 },
  { subject: 'Physics', score: 81, trend: 'up', questions: 40 },
  { subject: 'Chemistry', score: 65, trend: 'down', questions: 40 },
]

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [expandedYear, setExpandedYear] = useState<string | null>('2023')
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768)

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const toggleYear = (year: string) => {
    if (expandedYear === year) {
      setExpandedYear(null)
    } else {
      setExpandedYear(year)
    }
  }

  const isMobile = screenWidth < 768

  const handleStartTest = (testId: string) => {
    router.push(`/test/instructions?testId=${testId}`)
  }

  const handleContinueTest = (testId: string) => {
    router.push(`/test/take?testId=${testId}`)
  }

  const handleViewResults = (testId: string) => {
    router.push(`/test/result?testId=${testId}`)
  }

  return (
    <div className={`${raleway.className} min-h-screen bg-gray-50 text-gray-900`} style={{ fontFamily: "'Raleway', sans-serif" }}>
      <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-10" style={{ fontFamily: "'Raleway', sans-serif" }}>
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3 flex justify-between items-center" style={{ fontFamily: "'Raleway', sans-serif" }}>
          <div className="flex items-center">
            <span className="text-blue-600 font-bold text-xl" style={{ fontFamily: "'Raleway', sans-serif" }}>eamcet<span className="text-gray-900">pro</span></span>
          </div>
          {/* Desktop Nav */}
          {!isMobile && (
            <nav className="flex items-center gap-4 md:gap-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md ${activeTab === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-900 hover:text-blue-600'}`}
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </button>
              <button 
                onClick={() => setActiveTab('tests')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md ${activeTab === 'tests' ? 'text-blue-600 bg-blue-50' : 'text-gray-900 hover:text-blue-600'}`}
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                <BookOpenIcon className="h-5 w-5" />
                <span>Test Series</span>
              </button>
              <button 
                onClick={() => setActiveTab('performance')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md ${activeTab === 'performance' ? 'text-blue-600 bg-blue-50' : 'text-gray-900 hover:text-blue-600'}`}
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>Performance</span>
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-1 px-3 py-2 rounded-md ${activeTab === 'profile' ? 'text-blue-600 bg-blue-50' : 'text-gray-900 hover:text-blue-600'}`}
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                <UserIcon className="h-5 w-5" />
                <span>Profile</span>
              </button>
            </nav>
          )}
          {/* Mobile Nav Button */}
          {isMobile && (
            <button className="p-2" onClick={() => setActiveTab('home')} style={{ fontFamily: "'Raleway', sans-serif" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-3">
            <button className="bg-blue-600 text-white p-2 rounded-full" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 md:px-8 pt-20 pb-20" style={{ fontFamily: "'Raleway', sans-serif" }}>
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="py-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
            <h1 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Dashboard</h1>
            
            {/* Performance overview card */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <h2 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>Performance Overview</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                <div className="bg-blue-50 rounded-lg p-3 text-center" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <p className="text-blue-600 font-bold text-xl" style={{ fontFamily: "'Raleway', sans-serif" }}>87%</p>
                  <p className="text-gray-600 text-xs" style={{ fontFamily: "'Raleway', sans-serif" }}>Accuracy</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <p className="text-blue-600 font-bold text-xl" style={{ fontFamily: "'Raleway', sans-serif" }}>142</p>
                  <p className="text-gray-600 text-xs" style={{ fontFamily: "'Raleway', sans-serif" }}>Avg. Score</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <p className="text-blue-600 font-bold text-xl" style={{ fontFamily: "'Raleway', sans-serif" }}>7</p>
                  <p className="text-gray-600 text-xs" style={{ fontFamily: "'Raleway', sans-serif" }}>Tests Taken</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <p className="text-blue-600 font-bold text-xl" style={{ fontFamily: "'Raleway', sans-serif" }}>2.5k</p>
                  <p className="text-gray-600 text-xs" style={{ fontFamily: "'Raleway', sans-serif" }}>Est. Rank</p>
                </div>
              </div>
              
              <div className="space-y-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {subjectPerformance.map((subject) => (
                  <div key={subject.subject}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>{subject.subject}</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2" style={{ fontFamily: "'Raleway', sans-serif" }}>{subject.score}%</span>
                        {subject.trend === 'up' ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.score}%` }}
                        transition={{ duration: 1 }}
                        className={`h-2 rounded-full ${subject.subject === 'Mathematics' ? 'bg-blue-600' : subject.subject === 'Physics' ? 'bg-purple-600' : 'bg-emerald-600'}`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent tests section */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <h2 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>Recent Tests</h2>
              
              <div className="space-y-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {recentTests.map((test) => (
                  <div key={test.id} className="border border-gray-100 rounded-lg p-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>{test.name}</h3>
                        <p className="text-xs text-gray-900 flex items-center" style={{ fontFamily: "'Raleway', sans-serif" }}>
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {test.date}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {test.completed ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center" style={{ fontFamily: "'Raleway', sans-serif" }}>
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full" style={{ fontFamily: "'Raleway', sans-serif" }}>In Progress</span>
                        )}
                      </div>
                    </div>
                    
                    {test.completed && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Score:</span>
                          <span className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>{test.score} / {test.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(test.score! / test.total) * 100}%` }}
                            transition={{ duration: 0.5 }}
                            className="bg-blue-600 h-2 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end">
                      <button 
                        onClick={() => test.completed ? handleViewResults(test.id.toString()) : handleContinueTest(test.id.toString())}
                        className="text-blue-600 text-sm hover:text-blue-700"
                        style={{ fontFamily: "'Raleway', sans-serif" }}
                      >
                        {test.completed ? 'View Results' : 'Continue Test'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <button className="text-blue-600 text-sm hover:text-blue-700" style={{ fontFamily: "'Raleway', sans-serif" }}>View All Tests</button>
              </div>
            </div>
            
            {/* Recommended tests section */}
            <div className="bg-white rounded-lg shadow-sm p-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <h2 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>Recommended Tests</h2>
              
              <div className="space-y-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
                <div className="border border-gray-100 rounded-lg p-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <h3 className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>AP EAMCET 2023 - Set A</h3>
                  <p className="text-xs text-gray-900 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>Start this test to improve your preparation</p>
                  <button 
                    onClick={() => handleStartTest('recommended-test-1')}
                    className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
                    style={{ fontFamily: "'Raleway', sans-serif" }}
                  >
                    Start Test
                  </button>
                </div>
                
                <div className="border border-gray-100 rounded-lg p-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <h3 className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>Full Length Mock Test #3</h3>
                  <p className="text-xs text-gray-900 mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>Boost your test-taking strategy</p>
                  <button className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 transition" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    Start Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Test Series Tab */}
        {activeTab === 'tests' && (
          <div className="py-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>Test Series</h1>
            
            {allTestSeries.map((series) => (
              <div key={series.year} className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden" style={{ fontFamily: "'Raleway', sans-serif" }}>
                <div 
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => toggleYear(series.year)}
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  <h2 className="font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>{series.year} Papers</h2>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-gray-500 transition-transform ${expandedYear === series.year ? 'rotate-180' : ''}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {expandedYear === series.year && (
                  <div className="p-4 border-t border-gray-100 space-y-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    {series.tests.map((test) => (
                      <div key={test.id} className="border border-gray-100 rounded-lg p-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>{test.name}</h3>
                          {test.completed && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center" style={{ fontFamily: "'Raleway', sans-serif" }}>
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              {test.score ? `${test.score}/160` : 'Completed'}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => test.completed ? handleViewResults(test.id.toString()) : handleStartTest(test.id.toString())}
                            className={`text-sm px-4 py-1.5 rounded-md ${test.completed ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'} transition`}
                            style={{ fontFamily: "'Raleway', sans-serif" }}
                          >
                            {test.completed ? 'View Results' : 'Take Test'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="py-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>Performance Analytics</h1>
            
            {/* Overall performance card */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <h2 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>Overall Performance</h2>
              
              {/* Mock chart area using colored blocks */}
              <div className="h-64 mb-4 bg-gray-50 rounded-lg p-3 flex items-end justify-between" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {[65, 73, 68, 80, 85, 79, 90].map((height, index) => (
                  <motion.div 
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`w-1/8 rounded-t-sm ${index % 2 === 0 ? 'bg-blue-500' : 'bg-blue-400'}`}
                  ></motion.div>
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>
                <span>Last 7 tests</span>
                <span>Latest test</span>
              </div>
            </div>
            
            {/* Subject-wise analysis */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <h2 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>Subject-wise Analysis</h2>
              
              <div className="space-y-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {subjectPerformance.map((subject) => (
                  <div key={subject.subject}>
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>{subject.subject}</h3>
                      <span className="text-sm font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>{subject.score}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.score}%` }}
                        transition={{ duration: 1 }}
                        className={`h-2 rounded-full ${subject.subject === 'Mathematics' ? 'bg-blue-600' : subject.subject === 'Physics' ? 'bg-purple-600' : 'bg-emerald-600'}`}
                      ></motion.div>
                    </div>
                    
                    {/* Mock topic-wise performance */}
                    <div className="grid grid-cols-2 gap-2 text-sm" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      <div className="flex justify-between">
                        <span className="text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Correct</span>
                        <span className="font-medium text-green-600" style={{ fontFamily: "'Raleway', sans-serif" }}>{Math.round(subject.score/100 * subject.questions)}/{subject.questions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Time per question</span>
                        <span className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>1.2 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Accuracy</span>
                        <span className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>{subject.score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Rank Percentile</span>
                        <span className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>{85 + Math.floor(Math.random() * 10)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Time analysis card */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <h2 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>Time Analysis</h2>
              
              {/* Circular progress chart using SVG */}
              <div className="flex justify-center mb-6">
                <div className="relative h-48 w-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#2d99f1ba" strokeWidth="10" />
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 * (1 - 0.75) }}
                      transition={{ duration: 1.5 }}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    <span className="text-3xl font-bold text-blue-600" style={{ fontFamily: "'Raleway', sans-serif" }}>75%</span>
                    <span className="text-gray-500 text-sm" style={{ fontFamily: "'Raleway', sans-serif" }}>Efficiency</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                <div className="bg-gray-50 p-3 rounded-lg" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <p className="text-sm text-gray-600 mb-1" style={{ fontFamily: "'Raleway', sans-serif" }}>Avg. Time per Question</p>
                  <p className="font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>1.2 minutes</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <p className="text-sm text-gray-600 mb-1" style={{ fontFamily: "'Raleway', sans-serif" }}>Questions Attempted</p>
                  <p className="font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>155/160</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <p className="text-sm text-gray-600 mb-1" style={{ fontFamily: "'Raleway', sans-serif" }}>Time Management Score</p>
                  <p className="font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>Good</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <p className="text-sm text-gray-600 mb-1" style={{ fontFamily: "'Raleway', sans-serif" }}>Questions Reviewed</p>
                  <p className="font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>45</p>
                </div>
              </div>
            </div>
            
            {/* Test history card */}
            <div className="bg-white rounded-lg shadow-sm p-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <h2 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>Test History</h2>
              
              <div className="space-y-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {recentTests.filter(test => test.completed).map((test) => (
                  <div key={test.id} className="border border-gray-100 rounded-lg p-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>{test.name}</h3>
                        <p className="text-xs text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>{test.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>{test.score}/{test.total}</p>
                        <p className="text-xs text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>{Math.round((test.score! / test.total) * 100)}%</p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(test.score! / test.total) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-blue-600 h-2 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Profile Tab (basic structure) */}
        {activeTab === 'profile' && (
          <div className="py-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>Your Profile</h1>
            
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <div className="flex flex-col items-center mb-4">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <UserIcon className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="font-semibold text-lg" style={{ fontFamily: "'Raleway', sans-serif" }}>Rahul Sharma</h2> 
                <p className="text-sm text-gray-600" style={{ fontFamily: "'Raleway', sans-serif" }}>rahul.s@gmail.com</p>
              </div>
              
              <div className="space-y-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-medium mb-2" style={{ fontFamily: "'Raleway', sans-serif" }}>Account Details</h3>
                  <div className="space-y-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    <div className="flex justify-between">
                      <span className="text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Membership</span>
                      <span className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>Premium</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Valid Until</span>
                      <span className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>June 30, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Tests Taken</span>
                      <span className="font-medium" style={{ fontFamily: "'Raleway', sans-serif" }}>7</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-medium mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>Preferences</h3>
                  <div className="space-y-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Email Notifications</span>
                      <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                        <div className="h-4 w-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>Result Summary Email</span>
                      <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                        <div className="h-4 w-4 bg-white rounded-full absolute top-1 left-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-center">
                  <button className="text-red-600 hover:text-red-700" style={{ fontFamily: "'Raleway', sans-serif" }}>Log Out</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
