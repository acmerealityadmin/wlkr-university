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
export function SearchCommand({ locale }: { locale: string }) {
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-xs items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-400 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">{t('placeholder')}</span>
        <kbd className="hidden rounded border border-gray-200 px-1.5 text-[10px] text-gray-400 sm:inline dark:border-gray-700">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <Command shouldFilter={false} className="w-full">
              <div className="flex items-center gap-2 border-b border-gray-100 px-2 pb-2 dark:border-gray-800">
                <Search className="h-4 w-4 text-gray-400" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder={t('placeholder')}
                  className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={onMicClick}
                  aria-label={t('voiceHint')}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    voice.state === 'recording' && 'animate-pulse text-red-500',
                  )}
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {voice.state === 'recording' && <p className="px-2 py-2 text-xs text-red-500">{t('listening')}</p>}
              <Command.List className="max-h-80 overflow-y-auto p-2">
                {!loading && query && results.length === 0 && (
                  <Command.Empty className="py-6 text-center text-sm text-gray-400">{t('noResults')}</Command.Empty>
                )}
                {results.map((r) => (
                  <Command.Item
                    key={r.id}
                    value={r.id}
                    onSelect={() => {
                      setOpen(false);
                      window.location.href = `/${locale}${r.url}`;
                    }}
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-brand-50 dark:data-[selected=true]:bg-brand-900/20"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">{r.title}</div>
                    {r.excerpt && <div className="line-clamp-1 text-xs text-gray-500">{r.excerpt}</div>}
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
