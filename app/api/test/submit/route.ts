import { NextResponse } from 'next/server';
import { requireAuth } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { TestResult } from '@/types/test';

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const userId = await requireAuth();

    // Get request body
    const body = await request.json();
    const { testId, answers, timeTaken } = body;

    if (!testId || !answers || !timeTaken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient();

    // Get test data for evaluation
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('test_id', testId)
      .single();

    if (testError || !test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Get questions for evaluation
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId);

    if (questionsError || !questions) {
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      );
    }

    // Evaluate answers and calculate scores
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

    // Create test result
    const result: Omit<TestResult, 'result_id'> = {
      user_id: userId,
      test_id: testId,
      submitted_at: new Date().toISOString(),
      time_taken: timeTaken,
      answers,
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

    // Save test result
    const { data: savedResult, error: saveError } = await supabase
      .from('test_results')
      .insert(result)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving test result:', saveError);
      return NextResponse.json(
        { error: 'Failed to save test result' },
        { status: 500 }
      );
    }

    // Update user analytics
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

    return NextResponse.json(savedResult);
  } catch (error) {
    console.error('Error submitting test:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit test' },
      { status: 500 }
    );
  }
}

function determineWeakAreas(sectionAnalysis: TestResult['section_wise_analysis']): string[] {
  const weakAreas: string[] = [];
  const sections = Object.entries(sectionAnalysis);

  sections.forEach(([section, analysis]) => {
    const totalQuestions = section === 'maths' ? 80 : 40;
    const scorePercentage = (analysis.correct / totalQuestions) * 100;

    if (scorePercentage < 50) {
      weakAreas.push(section.charAt(0).toUpperCase() + section.slice(1));
    }
  });

  return weakAreas;
}

function determineStrongAreas(sectionAnalysis: TestResult['section_wise_analysis']): string[] {
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