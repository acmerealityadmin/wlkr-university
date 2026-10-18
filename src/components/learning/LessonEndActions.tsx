'use client';

import { useState } from 'react';
import { ClipboardList, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { feedbackApi } from '@/lib/api';
import type { Quiz } from '@/types/api';

export function LessonEndActions({
  courseId,
  courseSlug,
  lessonId,
  quizzes,
}: {
  courseId: string;
  courseSlug: string;
  lessonId: string;
  quizzes: Quiz[];
}) {
  const t = useTranslations('app.course');
  const [open, setOpen] = useState(false);
  const [about, setAbout] = useState<'lesson' | 'course'>('lesson');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const send = async () => {
    const note = body.trim();
    if (!note) {
      setError(t('feedbackMissing'));
      return;
    }
    setSending(true);
    setError('');
    try {
      await feedbackApi.create({
        courseId,
        lessonId: about === 'lesson' ? lessonId : undefined,
        body: note,
      });
      setSent(true);
      setBody('');
    } catch {
      setError(t('feedbackError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-10 flex flex-wrap items-end gap-8">
      {quizzes.map((quiz) => (
        <Link
          key={quiz.id}
          href={`/app/courses/${courseSlug}/quizzes?quiz=${quiz.id}`}
          className="flex flex-col items-center gap-2 text-brand-700 hover:text-brand-800 dark:text-brand-300"
        >
          <span className="flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-md">
            <ClipboardList className="h-14 w-14" />
          </span>
          <span className="text-sm font-semibold">{quiz.title || t('quiz')}</span>
        </Link>
      ))}
      <button
        type="button"
        onClick={() => { setOpen(true); setSent(false); setError(''); }}
        className="flex flex-col items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-gray-200"
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white text-brand-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-brand-300">
          <MessageSquare className="h-10 w-10" />
        </span>
        <span className="text-sm font-semibold">{t('feedback')}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('feedbackTitle')}</DialogTitle>
            <DialogDescription>{t('feedbackHint')}</DialogDescription>
          </DialogHeader>
          <fieldset className="space-y-2 text-sm">
            <legend className="font-medium text-gray-800 dark:text-gray-200">{t('feedbackAbout')}</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="feedback-about" checked={about === 'lesson'} onChange={() => setAbout('lesson')} />
              {t('feedbackLesson')}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="feedback-about" checked={about === 'course'} onChange={() => setAbout('course')} />
              {t('feedbackCourse')}
            </label>
          </fieldset>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
            placeholder={t('feedbackPlaceholder')}
            className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          />
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          {sent && <p className="mt-2 text-sm text-brand-700 dark:text-brand-300">{t('feedbackSent')}</p>}
          <DialogFooter>
            <Button type="button" onClick={send} disabled={sending}>{sending ? t('feedbackSending') : t('feedbackSend')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
