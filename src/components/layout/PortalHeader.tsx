'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SearchCommand } from '@/components/search/SearchCommand';
import { UserMenu } from '@/components/layout/UserMenu';
import { useAuth } from '@/store/auth';

function pageTitle(pathname: string, t: (key: string) => string) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (path.includes('/understanding') || path.includes('/practice')) return t('understanding');
  if (path.includes('/quiz')) return t('quiz');
  if (path.includes('/lessons/')) return t('lesson');
  if (path.startsWith('/app/webinars')) return t('webinars');
  if (path.startsWith('/webinars')) return t('webinars');
  if (path.startsWith('/app/training')) return t('training');
  if (path.startsWith('/app/courses')) return t('course');
  if (path.startsWith('/app/dashboard')) return t('dashboard');
  if (path.startsWith('/app/calendar')) return t('calendar');
  if (path.startsWith('/app/certificates')) return t('certificates');
  if (path.startsWith('/app/settings')) return t('settings');
  if (path.startsWith('/app/profile')) return t('profile');
  if (path.startsWith('/certificates/verify')) return t('verify');
  if (path.startsWith('/articles/') && path !== '/articles') return t('article');
  if (path.startsWith('/articles')) return t('articles');
  if (path.startsWith('/courses/') && path !== '/courses') return t('course');
  if (path.startsWith('/courses')) return t('courses');
  if (path.startsWith('/media')) return t('media');
  if (path === '/') return t('home');
  return t('home');
}

export function PortalHeader({
  locale,
  onMenuClick,
}: {
  locale: string;
  onMenuClick: () => void;
}) {
  const t = useTranslations('common.pageTitles');
  const pathname = usePathname();
  const { user } = useAuth();
  const title = pageTitle(pathname, t);

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-white/60 bg-white/70 px-5 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-950/80 lg:px-10">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-gray-500 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="truncate font-heading text-2xl font-semibold text-gray-900 dark:text-white md:text-3xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <SearchCommand locale={locale} />
        <ThemeToggle />
        {user && <UserMenu />}
      </div>
    </header>
  );
}
