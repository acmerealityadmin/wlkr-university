import { defineRouting } from 'next-intl/routing';

// Matches wlkr-ecko-server's config.cannedText.locales (src/config.js) — the
// languages already supported platform-wide. Only `en` is fully translated at
// launch; the rest are scaffolded and fall back to `en` (see request.ts).
export const locales = ['en', 'es', 'fr', 'de', 'zh', 'hi', 'ja', 'fa', 'ru'] as const;

export type AppLocale = (typeof locales)[number];

export const localeLabels: Record<AppLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  hi: 'हिन्दी',
  ja: '日本語',
  fa: 'فارسی',
  ru: 'Русский',
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});
