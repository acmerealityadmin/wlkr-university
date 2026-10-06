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
            'inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden',
            className,
          )}
        >
          <Search className="h-4 w-4" />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t('openHint')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              'hidden h-9 w-64 shrink-0 items-center gap-2 rounded-xl border border-border bg-card/80 px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:border-brand-300/70 hover:bg-muted/60 lg:flex',
              className,
            )}
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 truncate text-left">{t('placeholder')}</span>
            <kbd className="hidden rounded-md border border-border px-1.5 text-[10px] text-muted-foreground sm:inline">⌘K</kbd>
          </button>
        </>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/75 pt-[18vh] backdrop-blur-md" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900"
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
                  className="h-10 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={onMicClick}
                  aria-label={t('voiceHint')}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted',
                    voice.state === 'recording' && 'animate-pulse text-red-500',
                  )}
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
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
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-accent"
                  >
                    <div className="font-medium text-foreground">{r.title}</div>
                    {r.excerpt && <div className="line-clamp-1 text-xs text-muted-foreground">{r.excerpt}</div>}
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
