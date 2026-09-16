'use client';

import { useEffect } from 'react';
import { routing } from '@/i18n/routing';

/**
 * Root entry point. Static export has no middleware, so there's no
 * request-time way to redirect the bare `/` to a locale segment — this is
 * also Capacitor's required webDir entry file (out/index.html). Picks the
 * browser's language if it's one we support, else the default locale, and
 * does a client-side replace immediately on load.
 */
export default function RootRedirect() {
  useEffect(() => {
    const preferred = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : routing.defaultLocale;
    const locale = (routing.locales as readonly string[]).includes(preferred) ? preferred : routing.defaultLocale;
    window.location.replace(`/${locale}/`);
  }, []);

  return (
    <noscript>
      <a href={`/${routing.defaultLocale}/`}>Continue to WLKR University</a>
    </noscript>
  );
}
