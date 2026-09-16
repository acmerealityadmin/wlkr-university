'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { coursesApi, quizzesApi } from '@/lib/api';
import type { Quiz, QuizAttemptResult } from '@/types/api';

export function QuizView({ courseSlug }: { courseSlug: string }) {
  const t = useTranslations('app.quiz');
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { courses } = await coursesApi.list({ limit: 100 });
      const course = courses.find((c) => c.slug === courseSlug);
      if (!course) {
        if (!cancelled) setQuiz(null);
        return;
      }
      const { quizzes } = await quizzesApi.listForCourse(course._id);
      if (!cancelled) setQuiz(quizzes[0] ?? null);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [courseSlug]);

  const onSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionIndex, selectedIndex]) => ({
        questionIndex: Number(questionIndex),
        selectedIndex,
      }));
      const data = await quizzesApi.submitAttempt(quiz.id, payload);
      setResult(data);
    } catch {
      toast.error('Unable to submit your answers right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (quiz === undefined) return <PageSpinner />;
  if (quiz === null) return <p className="text-gray-500">No quiz found for this course.</p>;

  if (result) {
    return (
      <div className="max-w-lg">
        <h1 className="font-heading text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h1>
        <p className="mt-4 text-lg font-medium">
          {result.attempt.passed ? t('passed') : t('failed')}
        </p>
        <p className="mt-1 text-gray-500">
          {t('score')}: {result.attempt.score}% ({t('passingScore')}: {quiz.passingScorePercent}%)
        </p>
        {result.certificate && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
            <p className="font-medium text-emerald-800 dark:text-emerald-300">{t('certificateEarned')}</p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/app/certificates">{t('viewCertificate')}</Link>
            </Button>
          </div>
        )}
        {!result.attempt.passed && (
          <Button className="mt-6" onClick={() => setResult(null)}>
            {t('submit')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</h1>
      <div className="mt-6 space-y-6">
        {quiz.questions.map((q, qIndex) => (
          <fieldset key={qIndex} className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <legend className="px-1 font-medium text-gray-900 dark:text-gray-100">{q.prompt}</legend>
            <div className="mt-2 space-y-2">
              {q.choices.map((choice, cIndex) => (
                <label key={cIndex} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    checked={answers[qIndex] === cIndex}
                    onChange={() => setAnswers((prev) => ({ ...prev, [qIndex]: cIndex }))}
                  />
                  {choice}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <Button onClick={onSubmit} disabled={submitting} className="mt-6">
        {submitting ? t('submitting') : t('submit')}
      </Button>
    </div>
  );
}
