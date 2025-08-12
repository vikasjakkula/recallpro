import { createClient } from '@/utils/supabase/client';
import { TestData, Test, Section, Question } from '@/types/test';

export async function getTestData(testId: number): Promise<TestData> {
  const supabase = createClient();

  // Fetch test details
  const { data: test, error: testError } = await supabase
    .from('tests')
    .select('*')
    .eq('test_id', testId)
    .single();

  if (testError) throw testError;

  // Fetch sections
  const { data: sections, error: sectionsError } = await supabase
    .from('sections')
    .select('*')
    .eq('test_id', testId);

  if (sectionsError) throw sectionsError;

  // Fetch questions for all sections
  const sectionIds = sections.map(s => s.section_id);
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .in('section_id', sectionIds);

  if (questionsError) throw questionsError;

  // Group and number questions by section
  const orderedQuestions = questions.reduce((acc: Question[], question) => {
    const sectionName = question.section_id.split('_')[2].toLowerCase();
    const baseNumber = sectionName === 'maths' ? 0 :
                      sectionName === 'physics' ? 80 :
                      sectionName === 'chemistry' ? 120 : 0;
    
    // Adjust question numbers based on section
    // question.question_number is 1-based within each section
    const questionNumber = baseNumber + question.question_number;

    acc.push({
      ...question,
      question_number: questionNumber
    });
    return acc;
  }, []);

  // Sort questions by their new question numbers
  orderedQuestions.sort((a, b) => a.question_number - b.question_number);

  // Calculate section instructions
  const sectionInstructions = sections.map(section => {
    const sectionName = section.section_name.toLowerCase();
    let questionCount = 0;
    
    switch (sectionName) {
      case 'maths':
        questionCount = 80;
        break;
      case 'physics':
      case 'chemistry':
        questionCount = 40;
        break;
      default:
        questionCount = questions.filter(q => q.section_id === section.section_id).length;
    }

    return {
      name: section.section_name,
      questions: questionCount
    };
  });

  return {
    test,
    sections,
    questions: orderedQuestions,
    instructions: {
      duration: 180, // 3 hours in minutes
      sectionInstructions
    }
  };
}

export function getQuestionsBySection(questions: Question[], sectionName: string): Question[] {
  return questions.filter(q => {
    const section = q.section_id.split('_')[1]; // Extract section name from section_id
    return section.toLowerCase() === sectionName.toLowerCase();
  });
}

export function getQuestionNumber(question: Question): number {
  return question.question_number;
}

export function getQuestionOptions(question: Question): { id: string; content: string }[] {
  const options = [
    { id: 'a', content: question.option_a },
    { id: 'b', content: question.option_b },
    { id: 'c', content: question.option_c },
    { id: 'd', content: question.option_d }
  ];

  if (question.option_e) {
    options.push({ id: 'e', content: question.option_e });
  }

  if (question.option_f) {
    options.push({ id: 'f', content: question.option_f });
  }

  return options;
}

export async function submitTest(
  testId: number,
  answers: Record<number, string>,
  timeTaken: number,
  userId: string
): Promise<TestResult> {
  try {
    const response = await fetch('/api/test/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        testId,
        answers,
        timeTaken
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit test');
    }

    return response.json();
  } catch (error) {
    console.error('Error submitting test:', error);
    throw error;
  }
}

function evaluateTest(
  answers: Record<number, string>,
  questions: Question[]
): Omit<TestResult, 'result_id' | 'user_id' | 'test_id' | 'submitted_at' | 'time_taken' | 'answers'> {
  const sectionAnalysis = {
    maths: { correct: 0, wrong: 0, unattempted: 0, marks: 0 },
    physics: { correct: 0, wrong: 0, unattempted: 0, marks: 0 },
    chemistry: { correct: 0, wrong: 0, unattempted: 0, marks: 0 }
  };
  
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalUnattempted = 0;
  
  questions.forEach(question => {
    const section = question.section_id.split('_')[2].toLowerCase();
    const answer = answers[question.question_number];
    
    if (!answer) {
      totalUnattempted++;
      sectionAnalysis[section as keyof typeof sectionAnalysis].unattempted++;
    } else if (answer === question.correct_option) {
      totalCorrect++;
      sectionAnalysis[section as keyof typeof sectionAnalysis].correct++;
      sectionAnalysis[section as keyof typeof sectionAnalysis].marks += 1;
    } else {
      totalWrong++;
      sectionAnalysis[section as keyof typeof sectionAnalysis].wrong++;
    }
  });
  
  return {
    section_wise_marks: {
      maths: sectionAnalysis.maths.marks,
      physics: sectionAnalysis.physics.marks,
      chemistry: sectionAnalysis.chemistry.marks
    },
    total_marks: totalCorrect,
    correct_answers: totalCorrect,
    wrong_answers: totalWrong,
    unattempted: totalUnattempted,
    section_wise_analysis: sectionAnalysis
  };
}

import type { TestResult } from '@/types/test';

async function updateUserAnalytics(userId: string, result: TestResult) {
  const supabase = createClient();
  
  // Get existing analytics
  const { data: existingAnalytics } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (!existingAnalytics) {
    // Create new analytics
    const newAnalytics = {
      user_id: userId,
      total_tests_taken: 1,
      average_score: result.total_marks,
      section_wise_average: {
        maths: result.section_wise_marks.maths,
        physics: result.section_wise_marks.physics,
        chemistry: result.section_wise_marks.chemistry
      },
      improvement_trend: [{
        date: result.submitted_at,
        score: result.total_marks
      }],
      weak_areas: determineWeakAreas(result.section_wise_analysis),
      strong_areas: determineStrongAreas(result.section_wise_analysis),
      time_management: {
        average_time_per_question: result.time_taken / 160, // 160 total questions
        section_wise_time: {
          maths: result.time_taken * 0.5, // Assuming 50% time for maths
          physics: result.time_taken * 0.25,
          chemistry: result.time_taken * 0.25
        }
      }
    };
    
    await supabase
      .from('user_analytics')
      .insert(newAnalytics);
  } else {
    // Update existing analytics
    const updatedAnalytics = {
      total_tests_taken: existingAnalytics.total_tests_taken + 1,
      average_score: (existingAnalytics.average_score * existingAnalytics.total_tests_taken + result.total_marks) / (existingAnalytics.total_tests_taken + 1),
      section_wise_average: {
        maths: (existingAnalytics.section_wise_average.maths * existingAnalytics.total_tests_taken + result.section_wise_marks.maths) / (existingAnalytics.total_tests_taken + 1),
        physics: (existingAnalytics.section_wise_average.physics * existingAnalytics.total_tests_taken + result.section_wise_marks.physics) / (existingAnalytics.total_tests_taken + 1),
        chemistry: (existingAnalytics.section_wise_average.chemistry * existingAnalytics.total_tests_taken + result.section_wise_marks.chemistry) / (existingAnalytics.total_tests_taken + 1)
      },
      improvement_trend: [...existingAnalytics.improvement_trend, {
        date: result.submitted_at,
        score: result.total_marks
      }],
      weak_areas: determineWeakAreas(result.section_wise_analysis),
      strong_areas: determineStrongAreas(result.section_wise_analysis),
      time_management: {
        average_time_per_question: (existingAnalytics.time_management.average_time_per_question * existingAnalytics.total_tests_taken + result.time_taken / 160) / (existingAnalytics.total_tests_taken + 1),
        section_wise_time: {
          maths: (existingAnalytics.time_management.section_wise_time.maths * existingAnalytics.total_tests_taken + result.time_taken * 0.5) / (existingAnalytics.total_tests_taken + 1),
          physics: (existingAnalytics.time_management.section_wise_time.physics * existingAnalytics.total_tests_taken + result.time_taken * 0.25) / (existingAnalytics.total_tests_taken + 1),
          chemistry: (existingAnalytics.time_management.section_wise_time.chemistry * existingAnalytics.total_tests_taken + result.time_taken * 0.25) / (existingAnalytics.total_tests_taken + 1)
        }
      }
    };
    
    await supabase
      .from('user_analytics')
      .update(updatedAnalytics)
      .eq('user_id', userId);
  }
}

// Define a type for section analysis to fix type errors
type SectionAnalysis = {
  [section: string]: {
    correct: number;
    // You can add more fields if needed
  };
};

function determineWeakAreas(sectionAnalysis: SectionAnalysis): string[] {
  const weakAreas: string[] = [];
  const sections = Object.entries(sectionAnalysis);

  sections.forEach(([section, analysis]) => {
    // Ensure analysis is the expected type
    const totalQuestions = section === 'maths' ? 80 : 40;
    const scorePercentage = (analysis.correct / totalQuestions) * 100;

    if (scorePercentage < 50) {
      weakAreas.push(section.charAt(0).toUpperCase() + section.slice(1));
    }
  });

  return weakAreas;
}

function determineStrongAreas(sectionAnalysis: SectionAnalysis): string[] {
  const strongAreas: string[] = [];
  const sections = Object.entries(sectionAnalysis);

  sections.forEach(([section, analysis]) => {
    const totalQuestions = section === 'maths' ? 80 : 40;
    const scorePercentage = (analysis.correct / totalQuestions) * 100;
    
    if (scorePercentage >= 75) {
      strongAreas.push(section.charAt(0).toUpperCase() + section.slice(1));
    }
  });
  
  return strongAreas;
} 