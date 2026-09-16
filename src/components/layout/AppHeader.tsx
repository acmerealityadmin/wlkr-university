'use client';

import { useTranslations } from 'next-intl';
import { LogOut, Settings } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { SearchCommand } from '@/components/search/SearchCommand';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth';
import { useRouter } from '@/i18n/navigation';

export function AppHeader({ locale }: { locale: string }) {
  const t = useTranslations('common');
  const { user, logout } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="master-column flex h-16 items-center justify-between gap-4">
        <Link href="/app/dashboard" className="font-heading text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('siteName')}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex dark:text-gray-300">
          <Link href="/app/dashboard">{t('nav.dashboard')}</Link>
          <Link href="/app/certificates">{t('nav.certificates')}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <SearchCommand locale={locale} />
          </div>
          {user && <span className="hidden text-sm text-gray-500 sm:block">{user.email}</span>}
          <Link href="/app/settings" aria-label={t('nav.settings')} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <Settings className="h-4 w-4" />
          </Link>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            {t('nav.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
}
