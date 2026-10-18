'use client';

import { useSearchParams } from 'next/navigation';
import { QuizPlayer } from '@/components/learning/QuizPlayer';

export function QuizPlay({ courseSlug }: { courseSlug: string }) {
  const quizId = useSearchParams().get('quiz') || '';
  if (!quizId) return <p className="text-sm text-gray-500">Choose a quiz from the course.</p>;
  return <QuizPlayer courseSlug={courseSlug} quizId={quizId} />;
}