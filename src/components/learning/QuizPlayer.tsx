'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { coursesApi, quizMediaFile, quizzesApi } from '@/lib/api';
import { localizeQuiz } from '@/lib/localizedContent';
import type { Quiz, QuizAttemptResult, QuizQuestion } from '@/types/api';

type LocalAnswer = { selectedIndex?: number; text?: string; audioBlob?: Blob; audioUrl?: string };

function Stimulus({ question }: { question: QuizQuestion }) {
  const stimulus = question.stimulus;
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!stimulus?.mediaId || (stimulus.type !== 'image' && stimulus.type !== 'video')) return;
    let objectUrl = '';
    let cancelled = false;
    quizMediaFile(stimulus.mediaId).then((blob) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => {
      if (!cancelled) setUrl(null);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [stimulus?.mediaId, stimulus?.type]);

  if (!stimulus || stimulus.type === 'none') return null;
  if (stimulus.type === 'text') {
    return <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">{stimulus.text}</p>;
  }
  if (stimulus.type === 'image' && url) return <img src={url} alt="" className="mt-3 max-h-72 rounded-xl object-contain" />;
  if (stimulus.type === 'video' && url) return <video src={url} controls className="mt-3 max-h-72 w-full rounded-xl" />;
  return null;
}

export function QuizPlayer({ courseSlug, quizId }: { courseSlug: string; quizId: string }) {
  const t = useTranslations('app.quiz');
  const courseT = useTranslations('app.course');
  const locale = useLocale();
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const [answers, setAnswers] = useState<Record<number, LocalAnswer>>({});
  const [recording, setRecording] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { courses } = await coursesApi.listCatalog();
      const course = courses.find((item) => item.slug === courseSlug);
      if (!course) {
        if (!cancelled) setQuiz(null);
        return;
      }
      const { quizzes } = await quizzesApi.listForCourse(course._id);
      const found = quizzes.find((item) => item.id === quizId);
      if (!cancelled) setQuiz(found ? localizeQuiz(found, locale) : null);
    }
    load().catch(() => {
      if (!cancelled) setQuiz(null);
    });
    return () => {
      cancelled = true;
    };
  }, [courseSlug, quizId, locale]);

  const setAnswer = (index: number, patch: LocalAnswer) => {
    setAnswers((current) => ({ ...current, [index]: { ...current[index], ...patch } }));
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(null);
  };

  const startRecording = async (index: number) => {
    try {
      if (recording != null) stopRecording();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined;
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        setAnswer(index, { audioBlob, audioUrl: URL.createObjectURL(audioBlob) });
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(index);
    } catch {
      toast.error('Microphone is unavailable.');
    }
  };

  const onSubmit = async () => {
    if (!quiz) return;
    const missing = quiz.questions.some((question, index) => {
      const answer = answers[index] || {};
      const kind = question.kind === 'essay' ? 'essay' : 'choice';
      if (kind === 'choice') return answer.selectedIndex == null;
      const textOk = question.allowText !== false && Boolean(answer.text?.trim());
      const audioOk = question.allowAudio === true && Boolean(answer.audioBlob);
      if (question.allowText !== false && question.allowAudio) return !(textOk || audioOk);
      if (question.allowAudio) return !audioOk;
      return !textOk;
    });
    if (missing) {
      toast.error(t('missing'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = [];
      for (let index = 0; index < quiz.questions.length; index += 1) {
        const question = quiz.questions[index];
        const answer = answers[index] || {};
        if (question.kind === 'essay') {
          let audioMediaId: string | null = null;
          if (answer.audioBlob) {
            const uploaded = await quizzesApi.uploadAnswerAudio(quiz.id, answer.audioBlob);
            audioMediaId = uploaded.mediaId;
          }
          payload.push({ questionIndex: index, text: answer.text || '', audioMediaId });
        } else {
          payload.push({ questionIndex: index, selectedIndex: answer.selectedIndex });
        }
      }
      const data = await quizzesApi.submitAttempt(quiz.id, payload);
      setResult(data);
    } catch {
      toast.error('Unable to submit your answers right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (quiz === undefined) return <PageSpinner />;
  if (quiz === null) return <p className="text-sm text-gray-500">{t('notFound')}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/app/courses/${courseSlug}`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        ← {courseT('backToCourse')}
      </Link>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">{quiz.title}</h1>
      {result ? (
        <div className="mt-6 space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-lg font-medium">{result.attempt.passed ? t('passed') : t('failed')}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('score')}: {result.attempt.score}% ({t('passingScore')}: {quiz.passingScorePercent}%)
          </p>
          {result.certificate && (
            <p className="text-sm text-emerald-700">
              {t('certificateEarned')}{' '}
              <Link href="/app/certificates" className="font-medium underline">{t('viewCertificate')}</Link>
            </p>
          )}
        </div>
      ) : (
        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {quiz.questions.map((question, index) => {
            const kind = question.kind === 'essay' ? 'essay' : 'choice';
            return (
              <fieldset key={index} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <legend className="px-1 font-medium text-foreground">{index + 1}. {question.prompt}</legend>
                <Stimulus question={question} />
                {kind === 'choice' ? (
                  <div className="mt-3 space-y-2">
                    {question.choices.map((choice, choiceIndex) => (
                      <label key={choiceIndex} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={`q-${index}`}
                          checked={answers[index]?.selectedIndex === choiceIndex}
                          onChange={() => setAnswer(index, { selectedIndex: choiceIndex })}
                        />
                        {choice}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    {question.allowText !== false && (
                      <textarea
                        value={answers[index]?.text || ''}
                        onChange={(event) => setAnswer(index, { text: event.target.value })}
                        rows={5}
                        placeholder={t('essayPlaceholder')}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                      />
                    )}
                    {question.allowAudio && (
                      <div className="flex flex-wrap items-center gap-2">
                        {recording === index ? (
                          <Button type="button" variant="outline" onClick={stopRecording}>{t('stop')}</Button>
                        ) : (
                          <Button type="button" variant="outline" onClick={() => startRecording(index)}>{t('record')}</Button>
                        )}
                        {answers[index]?.audioUrl && <audio src={answers[index].audioUrl} controls />}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>
            );
          })}
          <Button type="submit" disabled={submitting || recording != null}>
            {submitting ? t('submitting') : t('submit')}
          </Button>
        </form>
      )}
    </div>
  );
}
