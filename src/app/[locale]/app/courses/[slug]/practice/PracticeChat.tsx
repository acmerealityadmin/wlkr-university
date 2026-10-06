'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { LessonBody } from '@/components/learning/LessonBody';
import { practiceApi } from '@/lib/api';

type ChatMessage = { role: 'assistant' | 'user'; content: string; summary?: boolean };

export function PracticeChat({ courseSlug }: { courseSlug: string }) {
  const t = useTranslations('app.practice');
  const courseT = useTranslations('app.course');
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const busy = sending || summarizing;

  useEffect(() => {
    let cancelled = false;
    practiceApi
      .get(courseSlug)
      .then((data) => {
        if (!cancelled) setMessages([{ role: 'assistant', content: data.opening }]);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [courseSlug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, busy]);

  const conversation = () => (messages || []).filter((message) => !message.summary);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !messages || busy) return;
    const next = [...conversation(), { role: 'user' as const, content }];
    setMessages(next);
    setDraft('');
    setSending(true);
    setError('');
    try {
      const data = await practiceApi.send(courseSlug, next.slice(1));
      setMessages((current) => [...(current || next).filter((message) => !message.summary), { role: 'assistant', content: data.message }]);
    } catch {
      setError(t('error'));
    } finally {
      setSending(false);
    }
  };

  const onSummarize = async () => {
    if (!messages || busy) return;
    const history = conversation();
    const asked = history.some((message) => message.role === 'user');
    if (!asked) {
      setMessages([...history, { role: 'assistant', content: t('noQuestions'), summary: true }]);
      return;
    }
    setSummarizing(true);
    setError('');
    try {
      const data = await practiceApi.send(courseSlug, history.slice(1), true);
      setMessages([...history, { role: 'assistant', content: data.message, summary: true }]);
    } catch {
      setError(t('error'));
    } finally {
      setSummarizing(false);
    }
  };

  if (messages === null) return <PageSpinner />;
  if (messages.length === 0) return <p className="text-sm text-gray-500">{t('empty')}</p>;

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pe-1">
        <Link href={`/app/courses/${courseSlug}`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          ← {courseT('backToCourse')}
        </Link>
        {messages.map((message, index) => (
          <div key={index} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                message.role === 'user'
                  ? 'max-w-[85%] whitespace-pre-line rounded-2xl bg-brand-600 px-4 py-3 text-sm leading-relaxed text-white'
                  : 'max-w-[85%] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100'
              }
            >
              {message.role === 'assistant' ? <LessonBody body={message.content} /> : message.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSubmit} className="mt-3 border-t border-gray-200 bg-slate-50 pt-3 dark:border-gray-800 dark:bg-gray-950">
        <label className="sr-only" htmlFor="understanding-prompt">{t('placeholder')}</label>
        <div className="flex items-end gap-2">
          <textarea
            id="understanding-prompt"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={2}
            placeholder={t('placeholder')}
            className="min-h-12 flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <Button type="submit" disabled={busy || !draft.trim()}>
            {sending ? t('sending') : t('send')}
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">{error || t('privacy')}</p>
          <Button type="button" variant="outline" onClick={onSummarize} disabled={busy}>
            {summarizing ? t('summarizing') : t('summarize')}
          </Button>
        </div>
      </form>
    </div>
  );
}
