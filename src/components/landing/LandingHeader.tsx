'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/store/auth';
import { UniversityCrest } from '@/components/landing/UniversityCrest';

const NAV = [
  { href: '/courses', key: 'courses' },
  { href: '/webinars', key: 'webinars' },
  { href: '/articles', key: 'blog' },
  { href: '/media', key: 'media' },
] as const;

export function LandingHeader() {
  const t = useTranslations('common.nav');
  const { user, isInitialized, initialize } = useAuth();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-6 px-5 lg:px-10">
        <Link href="/" aria-label="WLKR University">
          <UniversityCrest size="sm" />
        </Link>
        {isInitialized && user && (
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-base font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2 sm:gap-3">
          {!(isInitialized && user) && (
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-full px-4 text-base font-bold text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:px-5"
            >
              {t('login')}
            </Link>
          )}
          <Link
            href={isInitialized && user ? '/app/dashboard' : '/signup'}
            className="inline-flex h-11 items-center rounded-full bg-white px-5 text-base font-bold text-brand-900 shadow-lift transition-transform hover:-translate-y-0.5 sm:px-6"
          >
            {isInitialized && user ? t('dashboard') : t('createAccount')}
          </Link>
        </div>
      </div>
    </header>
  );
}
