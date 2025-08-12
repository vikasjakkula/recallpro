// Copyright 2025 varun
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import { useState, useEffect, Suspense } from 'react';
import { Inter } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { TestData, TestProgress, Question } from '@/types/test';
import { getTestData, submitTest } from '@/utils/test';

// For rendering LaTeX equations
// import 'katex/dist/katex.min.css';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const inter = Inter({ subsets: ['latin'] });

// Add this helper function after the imports
const getActiveSectionFromQuestionNumber = (questionNumber: number): string => {
  if (questionNumber >= 1 && questionNumber <= 80) return 'Maths';
  if (questionNumber >= 81 && questionNumber <= 120) return 'Physics';
  if (questionNumber >= 121 && questionNumber <= 160) return 'Chemistry';
  return 'Maths'; // Default to Maths if out of range
};

function TestPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = parseInt(searchParams.get('testId') || '1', 10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [progress, setProgress] = useState<TestProgress>({
    currentQuestionId: 1,
    activeSection: '',
    answers: {},
    markedForReview: [],
    answeredAndMarkedForReview: [],
    visitedQuestions: [1],
    timeRemaining: 180 * 60, // 3 hours in seconds
  });
  
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check-session');
        const data = await response.json();

        if (!data.authenticated) {
          // Store current path before redirecting
          localStorage.setItem('redirectPath', `/test/take?testId=${testId}`);
          router.push('/auth/login');
          return;
        }

        // Get user details
        const userResponse = await fetch('/api/auth/user');
        const userData = await userResponse.json();
        setUserId(userData.id);
        setUserName(userData.name || 'Student'); // Set user's name, fallback to 'Student' if not available
      } catch (error) {
        console.error('Auth error:', error);
        setError('Authentication failed');
      }
    };

    checkAuth();
  }, [router, testId]);
  
  // Timer functionality
  useEffect(() => {
    if (!testData) return;

    const timer = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        timeRemaining: prev.timeRemaining - 1
      }));
      
      if (progress.timeRemaining <= 0) {
        clearInterval(timer);
        // Handle time's up scenario - auto submit
        handleSubmitTest();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [progress.timeRemaining, testData]);
  
  // Format time as HH:MM:SS
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Current question data
  const currentQuestion = testData?.questions.find(q => q.question_number === progress.currentQuestionId);
  
  // Navigation functions
  const goToQuestion = (questionId: number) => {
    if (!progress.visitedQuestions.includes(questionId)) {
      setProgress(prev => ({
        ...prev,
        visitedQuestions: [...prev.visitedQuestions, questionId]
      }));
    }
    
    const newActiveSection = getActiveSectionFromQuestionNumber(questionId);
    setProgress(prev => ({
      ...prev,
      currentQuestionId: questionId,
      activeSection: newActiveSection
    }));
  };
  
  const goToNextQuestion = () => {
    if (!testData) return;
    const nextId = progress.currentQuestionId + 1;
    if (nextId <= testData.questions.length) {
      goToQuestion(nextId);
    }
  };
  
  const goToPrevQuestion = () => {
    const prevId = progress.currentQuestionId - 1;
    if (prevId >= 1) {
      goToQuestion(prevId);
    }
  };
  
  // Answer handling
  const handleSelectAnswer = (optionId: string) => {
    setProgress(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [progress.currentQuestionId]: optionId
      },
      answeredAndMarkedForReview: prev.markedForReview.includes(progress.currentQuestionId)
        ? [...prev.answeredAndMarkedForReview.filter(id => id !== progress.currentQuestionId), progress.currentQuestionId]
        : prev.answeredAndMarkedForReview,
      markedForReview: prev.markedForReview.includes(progress.currentQuestionId)
        ? prev.markedForReview.filter(id => id !== progress.currentQuestionId)
        : prev.markedForReview
    }));
  };
  
  // Review marking
  const handleMarkForReview = () => {
    const questionId = progress.currentQuestionId;
    const isAnswered = progress.answers[questionId] !== undefined;
    
    setProgress(prev => {
      // If already marked for review, unmark it
      if (prev.markedForReview.includes(questionId) || prev.answeredAndMarkedForReview.includes(questionId)) {
        return {
          ...prev,
          markedForReview: prev.markedForReview.filter(id => id !== questionId),
          answeredAndMarkedForReview: prev.answeredAndMarkedForReview.filter(id => id !== questionId)
        };
      }
      
      // Otherwise mark it based on whether it's answered
      if (isAnswered) {
        return {
          ...prev,
          answeredAndMarkedForReview: [...prev.answeredAndMarkedForReview, questionId],
          markedForReview: prev.markedForReview.filter(id => id !== questionId)
        };
      } else {
        return {
          ...prev,
          markedForReview: [...prev.markedForReview, questionId],
          answeredAndMarkedForReview: prev.answeredAndMarkedForReview.filter(id => id !== questionId)
        };
      }
    });
  };
  
  const handleClearResponse = () => {
    setProgress(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [progress.currentQuestionId]: null
      },
      markedForReview: prev.markedForReview.filter(id => id !== progress.currentQuestionId),
      answeredAndMarkedForReview: prev.answeredAndMarkedForReview.filter(id => id !== progress.currentQuestionId)
    }));
  };
  
  const handleSaveAndNext = () => {
    goToNextQuestion();
  };
  
  const handleSubmitTest = async () => {
    if (!testData || !userId) return;
    
    try {
      // Calculate time taken (3 hours - remaining time)
      const timeTaken = (180 * 60) - progress.timeRemaining;
      
      // Filter out null answers
      const submittedAnswers = Object.entries(progress.answers).reduce((acc, [key, value]) => {
        if (value !== null) {
          acc[parseInt(key)] = value;
        }
        return acc;
      }, {} as Record<number, string>);
      
      const result = await submitTest(testId, submittedAnswers, timeTaken, userId);
      console.log('Test submitted successfully:', result);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to submit test');
    }
  };
  
  const getQuestionStatusClass = (questionId: number) => {
    const isAnswered = progress.answers[questionId] !== undefined;
    const isMarkedForReview = progress.markedForReview.includes(questionId);
    const isAnsweredAndMarked = progress.answeredAndMarkedForReview.includes(questionId);
    const isVisited = progress.visitedQuestions.includes(questionId);
    
    if (isAnsweredAndMarked) return 'bg-yellow-500 text-white';
    if (isMarkedForReview) return 'bg-yellow-500 text-white';
    if (isAnswered) return 'bg-green-500 text-white';
    if (isVisited) return 'bg-red-500 text-white';
    return 'bg-gray-200 text-gray-700';
  };
  
  const getQuestionsBySection = (sectionName: string): Question[] => {
    if (!testData) return [];
    return testData.questions.filter(q => {
      const section = getActiveSectionFromQuestionNumber(q.question_number);
      return section === sectionName;
    });
  };
  
  const renderContent = (content: string) => {
    // Simple content rendering - you can enhance this for LaTeX
    return content.split('\n').map((line, index) => (
      <p key={index} className="mb-2">
        {line}
      </p>
    ));
  };

  useEffect(() => {
    async function fetchTestData() {
      try {
        const data = await getTestData(testId);
        console.log('Test Data:', {
          test: data.test,
          sections: data.sections,
          questions: data.questions,
          instructions: data.instructions
        });
        setTestData(data);
        setProgress(prev => ({
          ...prev,
          activeSection: data.sections[0].section_name
        }));
      } catch (err) {
        setError('Failed to load test data. Please try again.');
        console.error('Error fetching test data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTestData();
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading test...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Test not found</div>
      </div>
    );
  }

  return (
    <MathJaxContext>
      <div className={`${inter.className} min-h-screen bg-gray-50`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="ml-4 text-lg font-medium text-gray-900">
                  {testData.test.test_name} - {userName}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900">
                  Time Remaining: {formatTime(progress.timeRemaining)}
                </div>
                <button
                  onClick={handleSubmitTest}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Submit Test
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-screen">
          {/* Sidebar */}
          <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block md:w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto`}>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Question Navigator</h3>
              
              {testData.sections.map((section) => (
                <div key={section.section_name} className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{section.section_name}</h4>
                  <div className="grid grid-cols-5 gap-1">
                    {getQuestionsBySection(section.section_name).map((question) => (
                      <button
                        key={question.question_number}
                        onClick={() => goToQuestion(question.question_number)}
                        className={`p-2 text-xs rounded ${
                          question.question_number === progress.currentQuestionId
                            ? 'ring-2 ring-blue-500 bg-blue-100'
                            : getQuestionStatusClass(question.question_number)
                        }`}
                      >
                        {question.question_number}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {currentQuestion && (
              <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {/* Question Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-500">
                        Question {currentQuestion.question_number} of {testData.questions.length}
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        {getActiveSectionFromQuestionNumber(currentQuestion.question_number)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleMarkForReview}
                        className={`px-3 py-1 text-sm rounded ${
                          progress.markedForReview.includes(currentQuestion.question_number) ||
                          progress.answeredAndMarkedForReview.includes(currentQuestion.question_number)
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Mark for Review
                      </button>
                      <button
                        onClick={handleClearResponse}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Clear Response
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="mb-6">
                    <MathJax>
                      <div className="prose max-w-none">
                        {renderContent(currentQuestion.question_text)}
                      </div>
                    </MathJax>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {[
                      { id: 'a', text: currentQuestion.option_a },
                      { id: 'b', text: currentQuestion.option_b },
                      { id: 'c', text: currentQuestion.option_c },
                      { id: 'd', text: currentQuestion.option_d },
                      ...(currentQuestion.option_e ? [{ id: 'e', text: currentQuestion.option_e }] : []),
                      ...(currentQuestion.option_f ? [{ id: 'f', text: currentQuestion.option_f }] : [])
                    ].map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          progress.answers[currentQuestion.question_number] === option.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.question_number}`}
                          value={option.id}
                          checked={progress.answers[currentQuestion.question_number] === option.id}
                          onChange={() => handleSelectAnswer(option.id)}
                          className="mr-3"
                        />
                        <MathJax>
                          <span className="text-sm">{option.text}</span>
                        </MathJax>
                      </label>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={goToPrevQuestion}
                      disabled={progress.currentQuestionId === 1}
                      className={`flex items-center px-4 py-2 rounded-md ${
                        progress.currentQuestionId === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <ChevronLeftIcon className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveAndNext}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Save & Next
                      </button>
                    </div>
                    
                    <button
                      onClick={goToNextQuestion}
                      disabled={progress.currentQuestionId === testData.questions.length}
                      className={`flex items-center px-4 py-2 rounded-md ${
                        progress.currentQuestionId === testData.questions.length
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestPageContent />
    </Suspense>
  );
}

