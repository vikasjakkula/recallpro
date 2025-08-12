"use client"
// pages/index.js

import Head from 'next/head';
import Image from 'next/image';
import { Raleway } from 'next/font/google';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client';

const raleway = Raleway({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

const useCountUp = (end: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};

export default function Home() {
  const router = useRouter()
  const [expandedSection, setExpandedSection] = useState('2023');
  const [activeTab, setActiveTab] = useState('previous');
  const successfulStudents = useCountUp(15000, 2000);
  const testPapers = useCountUp(200, 2000);
  const mathScore = useCountUp(72, 1500);
  const physicsScore = useCountUp(81, 1500);
  const chemistryScore = useCountUp(65, 1500);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // State to track if the navbar should be shrunk
  const [isNavbarShrunk, setIsNavbarShrunk] = useState(false);

  // Effect to handle scroll and shrink the navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsNavbarShrunk(true);
      } else {
        setIsNavbarShrunk(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection('');
    } else {
      setExpandedSection(section);
    }
  };

  const handlePurchase = async () => {
    try {
      // Check if session cookie exists
      const response = await fetch('/api/auth/check-session')
      const data = await response.json()

      // Store redirect path before checking auth
      localStorage.setItem('redirectPath', '/payment')

      if (data.authenticated) {
        // If logged in, go directly to payment
        router.push('/payment')
      } else {
        // If not logged in, go to login page
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Session check error:', error)
      // On error, redirect to login to be safe
      router.push('/auth/login')
    }
  }

  const supabase = createClient();
  // Fix: Move the async call into a useEffect and useState, since 'await' is not allowed at the top level of a component function.
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<any>(null);

  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from('pdfs')
          .createSignedUrl('1.Solutions.pdf', 60 * 60); // 1 hour
        if (error) setPdfError(error);
        setPdfUrl(data?.signedUrl || null);
      } catch (err) {
        setPdfError(err);
      }
    };
    fetchPdfUrl();
  }, []);
    // (Removed: invalid top-level code. PDF URL fetching is handled in useEffect above.)

  return (
    <div className={`${raleway.className} min-h-screen bg-white text-gray-900 font-raleway`}>
      <Head>
        <title>EAMCET Pro - Master Your EAMCET Preparation</title>
        <meta name="description" content="Ace your EAMCET exam with our smart test preparation platform" />
        {/* Use favico.ico as the favicon for the site. Place favico.ico in the public directory. */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>

      {/* Header Section - Full width at top, shrinks to 7/8 on scroll, floating and rounded */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none font-raleway">
        <div
          className={`
            pointer-events-auto
            transition-all duration-300
            ${isNavbarShrunk ? 'mt-2 w-7/8 max-w-6xl rounded-full shadow-xl bg-white/80 backdrop-blur-md border border-gray-200' : 'w-full rounded-none bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-none'}
            flex items-center
            px-6
            ${isNavbarShrunk ? 'py-2' : 'py-4'}
            font-raleway
          `}
        >
          {/* Logo - far left */}
          <div className="flex items-center flex-shrink-0 font-raleway">
            <Image
              src="/recallpro.png"
              alt="RecallPro Logo"
              width={isNavbarShrunk ? 80 : 120}
              height={isNavbarShrunk ? 80 : 120}
              className="mr-2 rounded cursor-pointer transition-all duration-300"
              onClick={() => window.location.href = '/'}
            />
          </div>
          {/* Centered navigation links */}
          <div className="flex-1 flex justify-center font-raleway">
            <nav className="flex items-center gap-8 font-raleway">
              <a href="#features" className="text-gray-600 font-raleway hover:text-blue-600 transition-colors">Features</a>
              <a href="#test-series" className="text-gray-600 font-raleway hover:text-blue-600 transition-colors">Test Series</a>
              <Link href="/syllabus" className="text-gray-600 font-raleway hover:text-blue-600 transition-colors">Syllabus</Link>
              <Link href="/cutoff" className="text-gray-600 font-raleway hover:text-blue-600 transition-colors">Cutoff's</Link>
              <a href="#pricing" className="text-gray-600 font-raleway hover:text-blue-600 transition-colors">Pricing</a>
            </nav>
          </div>
          {/* Recall and Get Started - far right, pill-shaped buttons */}
          <div className="flex items-center gap-4 flex-shrink-0 font-raleway">
            {/* Pill effect: rounded-full for both buttons */}
            <Link href="/recall" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition font-raleway">Recall</Link>
            <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition font-raleway">Get Started</Link>
          </div>
          {/* Mobile Nav Button (unchanged) */}
          <div className="md:hidden flex items-center ml-2 font-raleway">
            <button className="p-2" onClick={() => setMobileNavOpen(true)}>
              {/* Hamburger Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {/* Mobile Nav Drawer (unchanged) */}
          {mobileNavOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end font-raleway">
              <div className="w-4/5 max-w-xs bg-white h-full shadow-lg flex flex-col p-6 font-raleway">
                <button className="self-end mb-6" onClick={() => setMobileNavOpen(false)}>
                  {/* Close Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {/* Mobile Nav Links */}
                <a href="#features" className="mb-4 text-gray-700 hover:text-blue-600 font-raleway" onClick={() => setMobileNavOpen(false)}>Features</a>
                <a href="#test-series" className="mb-4 text-gray-700 hover:text-blue-600 font-raleway" onClick={() => setMobileNavOpen(false)}>Test Series</a>
                <a href="#marks-vs-rank" className="mb-4 text-gray-700 hover:text-blue-600 font-raleway" onClick={() => setMobileNavOpen(false)}>Cutoff's</a>
                <a href="#pricing" className="mb-4 text-gray-700 hover:text-blue-600 font-raleway" onClick={() => setMobileNavOpen(false)}>Pricing</a>
                <Link href="/recall" className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-raleway" onClick={() => setMobileNavOpen(false)}>Recall</Link>
                <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-raleway" onClick={() => setMobileNavOpen(false)}>Get Started</Link>
              </div>
            </div>
          )}
        </div>
      </header>

  {/* Add a spacer div to prevent content from being hidden behind the fixed navbar */}
  <div className={isNavbarShrunk ? 'h-16' : 'h-24'}></div>

      <main className="font-raleway">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 max-w-full py-8 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center font-raleway">
          <div>
            <p className="text-sm font-semibold text-blue-600 inline-block bg-blue-50 px-4 py-1 rounded-full mb-3 font-raleway">#1 EAMCET TEST PREPARATION IN AP & TS</p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 font-raleway">Master EAMCET with <span className="text-blue-600">Smart</span> Test Prep</h1>
            <p className="text-gray-600 mb-6 font-raleway">Maximize your score with our previous year papers and AI-powered performance analytics.</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10 font-raleway">
              <Link href="/auth/register" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition cursor-pointer text-center font-raleway">Start Preparing Now</Link>
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition cursor-pointer text-center font-raleway">View Test Series</button>
            </div>
            <div className="flex gap-8 sm:gap-12 flex-wrap font-raleway">
              <div>
                <p className="text-2xl font-bold text-gray-900 font-raleway">{successfulStudents}+</p>
                <p className="text-gray-500 text-sm font-raleway">Successful Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 font-raleway">{testPapers}+</p>
                <p className="text-gray-500 text-sm font-raleway">Test Papers</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg font-raleway">
            <h3 className="text-lg font-semibold mb-4 font-raleway">Your Performance Analytics</h3>
            <div className="space-y-4 mb-6 font-raleway">
              <div>
                <div className="flex justify-between mb-1 font-raleway">
                  <span className="text-sm text-gray-600 font-raleway">Mathematics</span>
                  <span className="text-sm font-medium text-gray-900 font-raleway">{mathScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 font-raleway">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out font-raleway" style={{ width: `${mathScore}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 font-raleway">
                  <span className="text-sm text-gray-600 font-raleway">Physics</span>
                  <span className="text-sm font-medium text-gray-900 font-raleway">{physicsScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 font-raleway">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out font-raleway" style={{ width: `${physicsScore}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 font-raleway">
                  <span className="text-sm text-gray-600 font-raleway">Chemistry</span>
                  <span className="text-sm font-medium text-gray-900 font-raleway">{chemistryScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 font-raleway">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out font-raleway" style={{ width: `${chemistryScore}%` }}></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-raleway">
              <div className="bg-blue-100 rounded-lg p-3 font-raleway">
                <p className="text-blue-600 font-bold text-xl font-raleway">87%</p>
                <p className="text-gray-600 text-xs font-raleway">Accuracy</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3 font-raleway">
                <p className="text-blue-600 font-bold text-xl font-raleway">142</p>
                <p className="text-gray-600 text-xs font-raleway">Score</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3 font-raleway">
                <p className="text-blue-600 font-bold text-xl font-raleway">32</p>
                <p className="text-gray-600 text-xs font-raleway">Mock Tests</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3 font-raleway">
                <p className="text-blue-600 font-bold text-xl font-raleway">2.5k</p>
                <p className="text-gray-600 text-xs font-raleway">Est. Rank</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-8 max-w-7xl py-16 bg-gray-50 font-raleway">
          <div className="text-center mb-12 font-raleway">
            <h2 className="text-3xl font-bold mb-3 font-raleway">Everything You Need for EAMCET Success</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-raleway">Comprehensive features designed to maximize your score and track your progress effectively.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 font-raleway">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition font-raleway">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 font-raleway">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-raleway">Real Exam Experience</h3>
              <p className="text-gray-600 font-raleway">Practice with realistic question formats and time constraints to simulate the actual EAMCET exam experience.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition font-raleway">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 font-raleway">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-raleway">Detailed Analytics</h3>
              <p className="text-gray-600 font-raleway">Get comprehensive insights into your strengths and weaknesses with subject-wise performance breakdown.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition font-raleway">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 font-raleway">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-raleway">Previous Year Papers</h3>
              <p className="text-gray-600 font-raleway">Access full sets of past EAMCET papers with detailed solutions to establish exam patterns.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition font-raleway">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 font-raleway">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-raleway">Topic-wise Tests</h3>
              <p className="text-gray-600 font-raleway">Practice specific subjects and topics to improve your understanding in each topic.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition font-raleway">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 font-raleway">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-raleway">Time Management</h3>
              <p className="text-gray-600 font-raleway">Learn to manage your time effectively with our detailed test performance and analysis reports.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition font-raleway">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 font-raleway">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-raleway">Peer Comparison</h3>
              <p className="text-gray-600 font-raleway">Track your progress against other test-takers with comprehensive analytical comparisons.</p>
            </div>
          </div>
        </section>

        {/* Test Collection Section */}
        <section id="test-series" className="container mx-auto px-8 max-w-7xl py-16 font-raleway">
          <div className="text-center mb-12 font-raleway">
            <h2 className="text-3xl font-bold mb-3 font-raleway">Comprehensive Test Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-raleway">Practice with our extensive library of previous year papers and mock tests designed for EAMCET success.</p>
          </div>
          <div className="flex gap-4 justify-center mb-12 font-raleway">
            <button 
              className={`px-6 py-3 rounded-md transition font-raleway ${activeTab === 'previous' ? 'bg-blue-600 text-white' : 'border border-blue-600 text-blue-600'}`}
              onClick={() => setActiveTab('previous')}
            >
              Previous Year Papers
            </button>
            <button 
              className={`px-6 py-3 rounded-md transition font-raleway ${activeTab === 'mock' ? 'bg-blue-600 text-white' : 'border border-blue-600 text-blue-600'}`}
              onClick={() => setActiveTab('mock')}
            >
              Mock Test Series
            </button>
          </div>

          {/* Test Paper Accordion */}
          <div className="max-w-4xl mx-auto font-raleway">
            {activeTab === 'previous' ? (
              <>
                <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden font-raleway">
                  <div 
                    className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer font-raleway"
                    onClick={() => toggleSection('2023')}
                  >
                    <h3 className="font-semibold font-raleway">EAMCET 2023 Papers</h3>
                    {expandedSection === '2023' ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  {expandedSection === '2023' && (
                    <div className="p-4 space-y-4 font-raleway">
                      <div className="border border-gray-200 rounded-lg p-4 font-raleway">
                        <div className="flex flex-wrap justify-between mb-2 font-raleway">
                          <h4 className="font-semibold font-raleway">TS EAMCET 2023 - Set A</h4>
                          <div className="flex gap-4 text-sm text-gray-600 font-raleway">
                            <span className="flex items-center gap-1 font-raleway">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              3 hours
                            </span>
                            <span className="flex items-center gap-1 font-raleway">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              160 questions
                            </span>
                          </div>
                        </div>
                        <button className="bg-blue-600/90 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition inline-block font-raleway">Take Test</button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 font-raleway">
                        <div className="flex flex-wrap justify-between mb-2 font-raleway">
                          <h4 className="font-semibold font-raleway">TS EAMCET 2023 - Set B</h4>
                          <div className="flex gap-4 text-sm text-gray-600 font-raleway">
                            <span className="flex items-center gap-1 font-raleway">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              3 hours
                            </span>
                            <span className="flex items-center gap-1 font-raleway">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              160 questions
                            </span>
                          </div>
                        </div>
                        <button className="bg-blue-600/90 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition inline-block font-raleway">Take Test</button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 font-raleway">
                        <div className="flex flex-wrap justify-between mb-2 font-raleway">
                          <h4 className="font-semibold font-raleway">AP EAMCET 2023 - Set A</h4>
                          <div className="flex gap-4 text-sm text-gray-600 font-raleway">
                            <span className="flex items-center gap-1 font-raleway">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              3 hours
                            </span>
                            <span className="flex items-center gap-1 font-raleway">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              160 questions
                            </span>
                          </div>
                        </div>
                        <button className="bg-blue-600/90 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition inline-block font-raleway">Take Test</button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 font-raleway">
                        <div className="flex flex-wrap justify-between mb-2 font-raleway">
                          <h4 className="font-semibold font-raleway">AP EAMCET 2023 - Set B</h4>
                          <div className="flex gap-4 text-sm text-gray-600 font-raleway">
                            <span className="flex items-center gap-1 font-raleway">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              3 hours
                            </span>
                            <span className="flex items-center gap-1 font-raleway">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              160 questions
                            </span>
                          </div>
                        </div>
                        <button className="bg-blue-600/90 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition inline-block font-raleway">Take Test</button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden font-raleway">
                  <div 
                    className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer font-raleway"
                    onClick={() => toggleSection('2022')}
                  >
                    <h3 className="font-semibold font-raleway">EAMCET 2022 Papers</h3>
                    {expandedSection === '2022' ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  {expandedSection === '2022' && (
                    <div className="p-4 font-raleway">
                      {/* Content similar to 2023 papers */}
                    </div>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg mb-8 overflow-hidden font-raleway">
                  <div 
                    className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer font-raleway"
                    onClick={() => toggleSection('2021')}
                  >
                    <h3 className="font-semibold font-raleway">EAMCET 2021 Papers</h3>
                    {expandedSection === '2021' ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  {expandedSection === '2021' && (
                    <div className="p-4 font-raleway">
                      {/* Content similar to 2023 papers */}
                    </div>
                  )}
                </div>
                
                <div className="text-center font-raleway">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition cursor-pointer font-raleway">View All Test Series</button>
                </div>
              </>
            ) : (
              <div className="space-y-4 font-raleway">
                <div className="border border-gray-200 rounded-lg p-4 font-raleway">
                  <div className="flex flex-wrap justify-between mb-2 font-raleway">
                    <h4 className="font-semibold font-raleway">Full Length Mock Test #1</h4>
                    <div className="flex gap-4 text-sm text-gray-600 font-raleway">
                      <span className="flex items-center gap-1 font-raleway">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        3 hours
                      </span>
                      <span className="flex items-center gap-1 font-raleway">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        160 questions
                      </span>
                    </div>
                  </div>
                  <button className="bg-blue-600/90 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition inline-block font-raleway">Take Test</button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 font-raleway">
                  <div className="flex flex-wrap justify-between mb-2 font-raleway">
                    <h4 className="font-semibold font-raleway">Full Length Mock Test #2</h4>
                    <div className="flex gap-4 text-sm text-gray-600 font-raleway">
                      <span className="flex items-center gap-1 font-raleway">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        3 hours
                      </span>
                      <span className="flex items-center gap-1 font-raleway">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        160 questions
                      </span>
                    </div>
                  </div>
                  <button className="bg-blue-600/90 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition inline-block font-raleway">Take Test</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600/95 py-20 relative overflow-hidden font-raleway">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-700/20"></div>
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23fff" fill-opacity="0.05" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")'
          }}></div>
          <div className="container mx-auto px-8 max-w-7xl text-center relative z-10 font-raleway">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-raleway">Ready to Ace Your EAMCET?</h2>
            <p className="max-w-2xl mx-auto mb-10 text-white/90 text-lg font-raleway">Join thousands of successful students who have achieved their dream ranks with eamcetpro.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-raleway">
              <button
                onClick={handlePurchase}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer font-raleway"
              >
                Purchase Now
              </button>
              <p className="text-white/80 text-sm font-raleway">Limited time offer - Save 64% today!</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-8 max-w-7xl py-16 font-raleway">
          <div className="text-center mb-12 font-raleway">
            <p className="text-sm font-semibold text-blue-600 mb-2 font-raleway">Pricing</p>
            <h2 className="text-3xl font-bold mb-3 font-raleway">Affordable Test Preparation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-raleway">Get complete access to our test series at a special discount price.</p>
          </div>
          
          <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden font-raleway">
            <div className="bg-blue-600 text-white p-6 text-center font-raleway">
              <h3 className="text-xl font-semibold font-raleway">Complete Test Series Package</h3>
              <p className="text-sm opacity-90 font-raleway">Everything you need for EAMCET success</p>
            </div>
            <div className="p-6 font-raleway">
              <div className="flex justify-center items-baseline mb-6 font-raleway">
                <span className="text-3xl font-bold font-raleway">₹900</span>
                <span className="text-gray-500 line-through ml-2 font-raleway">₹2500</span>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded ml-2 font-raleway">64% off</span>
              </div>
              <ul className="space-y-3 mb-6 font-raleway">
                <li className="flex items-center text-gray-600 font-raleway">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Access to all previous papers
                </li>
                <li className="flex items-center text-gray-600 font-raleway">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Full mock test series (10+ tests)
                </li>
                <li className="flex items-center text-gray-600 font-raleway">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Subject-wise practice tests
                </li>
                <li className="flex items-center text-gray-600 font-raleway">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Detailed performance analytics
                </li>
                <li className="flex items-center text-gray-600 font-raleway">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  One-time payment (no subscription)
                </li>
                <li className="flex items-center text-gray-600 font-raleway">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Valid until your EAMCET!
                </li>
              </ul>
              <button 
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition cursor-pointer font-raleway"
                onClick={handlePurchase}
              >
                Purchase Now
              </button>
              <div className="flex items-center justify-center gap-2 mt-4 font-raleway">
                <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-5" />
                <p className="text-xs text-gray-500 font-raleway">Secure payment by Razorpay</p>
              </div>
            </div>
          </div>
        </section>

        {/* Affiliate Section */}
        <section className="container mx-auto px-8 max-w-7xl py-8 mb-8 font-raleway">
          <div className="max-w-3xl mx-auto border border-gray-200 rounded-lg p-6 font-raleway">
            <h3 className="text-xl font-semibold mb-3 font-raleway">Affiliate Program</h3>
            <p className="text-gray-600 mb-4 font-raleway">Recommend eamcetpro to others and earn income! Join our affiliate program and earn commission on each successful referral.</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer font-raleway">Become an Affiliate</button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 pt-12 pb-6 font-raleway">
        <div className="container mx-auto px-8 max-w-7xl font-raleway">
          <div className="grid md:grid-cols-4 gap-8 mb-12 font-raleway">
            <div>
              <div className="flex items-center mb-4 font-raleway">
                {/* If using Next.js, import Image from 'next/image' at the top of your file */}
                {/* If not using Next.js, replace <Image ... /> with <img ... /> */}
                <img
                  src="/recallpro.png"
                  alt="RecallPro Logo"
                  width={150}
                  height={150}
                  className="mr-2 rounded cursor-pointer"
                  onClick={() => window.location.href = '/'}
                />
              </div>
              <p className="text-sm text-gray-600 mb-4 font-raleway">Helping students ace their TS &amp; AP EAMCET exams with comprehensive preparation tools.</p>
              <div className="flex space-x-4 font-raleway">
                <a href="#" className="text-gray-400 hover:text-blue-600 font-raleway" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram-icon h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 font-raleway" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter-icon h-5 w-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 font-raleway" aria-label="YouTube">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube-icon h-5 w-5"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 font-raleway" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook-icon h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 font-raleway" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin-icon h-5 w-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 font-raleway" aria-label="Link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link-icon h-5 w-5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 font-raleway">Quick Links</h3>
              <ul className="space-y-2 text-sm font-raleway">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 font-raleway">Home</a></li>
                <li><a href="#features" className="text-gray-600 hover:text-blue-600 font-raleway">Features</a></li>
                <li><a href="#test-series" className="text-gray-600 hover:text-blue-600 font-raleway">Test Series</a></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-blue-600 font-raleway">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 font-raleway">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 font-raleway">Resources</h3>
              <ul className="space-y-2 text-sm font-raleway">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 font-raleway">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 font-raleway">Study Tips</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 font-raleway">EAMCET Syllabus</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 font-raleway">Success Stories</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 font-raleway">Affiliate Program</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 font-raleway">Contact Us</h3>
              <ul className="space-y-2 text-sm font-raleway">
                <li className="flex items-start font-raleway">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 font-raleway">support@eamcetpro.com</span>
                </li>
                <li className="flex items-start font-raleway">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600 font-raleway">+91 90456 78234</span>
                </li>
                <li className="flex items-start font-raleway">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-gray-600 font-raleway">
                    <p>123, Tech Park, Hyderabad City</p>
                    <p>Telangana, 500081</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-gray-200 text-center font-raleway">
            <p className="text-sm text-gray-500 font-raleway">© 2025All rights reserved. eamcetpro. </p>
          </div>
        </div>
      </footer>
    </div>
  );
}