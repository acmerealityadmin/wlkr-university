'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations('common.theme');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className={cn('inline-flex h-9 w-9', className)} aria-hidden />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('toggle')}
      className={cn('relative text-muted-foreground', className)}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

export function ThemePicker() {
  const t = useTranslations('common.theme');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const options = [
    { value: 'light', label: t('light'), swatch: 'bg-[#f7f5fb] border-black/10' },
    { value: 'dark', label: t('dark'), swatch: 'bg-[#0b0914] border-white/15' },
    { value: 'system', label: t('system'), swatch: 'bg-gradient-to-br from-[#f7f5fb] to-[#0b0914] border-black/10' },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => {
        const selected = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              'flex flex-col gap-2 rounded-2xl border p-3 text-left transition-all',
              selected
                ? 'border-brand-400 bg-accent shadow-sm ring-2 ring-brand-500/30'
                : 'border-border bg-card hover:border-brand-300/70 hover:bg-muted/60',
            )}
          >
            <span className={cn('h-10 w-full rounded-lg border', option.swatch)} />
            <span className="text-sm font-medium text-foreground">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
