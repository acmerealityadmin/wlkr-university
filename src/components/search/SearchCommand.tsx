'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Mic, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';
import { searchApi } from '@/lib/api';
import type { SearchResult } from '@/types/api';
import { cn } from '@/lib/utils';

/** Header-mounted sitewide search command palette with a microphone button
 * for voice search (POST /v1/university/voice/transcribe). Mounted in both
 * the (public) and (app) layouts. */
export function SearchCommand({
  locale,
  compact = false,
  className,
}: {
  locale: string;
  compact?: boolean;
  className?: string;
}) {
  const t = useTranslations('common.search');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const voice = useVoiceCapture(locale);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchApi
      .query(debouncedQuery)
      .then((data) => setResults(data.results))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const onMicClick = async () => {
    if (voice.state === 'idle') {
      await voice.start();
    } else if (voice.state === 'recording') {
      const text = await voice.stopAndTranscribe();
      if (text) setQuery(text);
    }
  };

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('openHint')}
          className={cn(
            'inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-brand-50 hover:text-brand-700 sm:hidden',
            className,
          )}
        >
          <Search className="h-5 w-5" />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t('openHint')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-brand-50 hover:text-brand-700 lg:hidden"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              'hidden h-12 w-72 shrink-0 items-center gap-3 rounded-full border-2 border-gray-100 bg-white px-5 text-base text-gray-400 shadow-soft transition-colors hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 lg:flex',
              className,
            )}
          >
            <Search className="h-5 w-5" />
            <span className="flex-1 truncate text-left">{t('placeholder')}</span>
            <kbd className="hidden rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500 dark:bg-gray-800 sm:inline">⌘K</kbd>
          </button>
        </>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/75 pt-[18vh] backdrop-blur-md" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-3 shadow-lift dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <Command shouldFilter={false} className="w-full">
              <div className="flex items-center gap-2 border-b border-border px-2 pb-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder={t('placeholder')}
                  className="h-12 flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={onMicClick}
                  aria-label={t('voiceHint')}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-brand-50 hover:text-brand-700',
                    voice.state === 'recording' && 'animate-pulse text-red-500',
                  )}
                >
                  <Mic className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {voice.state === 'recording' && <p className="px-2 py-2 text-xs text-red-500">{t('listening')}</p>}
              <Command.List className="max-h-80 overflow-y-auto p-2">
                {!loading && query && results.length === 0 && (
                  <Command.Empty className="py-6 text-center text-sm text-muted-foreground">{t('noResults')}</Command.Empty>
                )}
                {results.map((r) => (
                  <Command.Item
                    key={r.id}
                    value={r.id}
                    onSelect={() => {
                      setOpen(false);
                      window.location.href = `/${locale}${r.url}`;
                    }}
                    className="cursor-pointer rounded-2xl px-4 py-3 text-base data-[selected=true]:bg-brand-50 dark:data-[selected=true]:bg-brand-500/15"
                  >
                    <div className="font-bold text-foreground">{r.title}</div>
                    {r.excerpt && <div className="line-clamp-1 text-sm text-muted-foreground">{r.excerpt}</div>}
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
