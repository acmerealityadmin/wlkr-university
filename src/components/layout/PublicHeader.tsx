import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SearchCommand } from '@/components/search/SearchCommand';
import { Button } from '@/components/ui/button';

export function PublicHeader({ locale }: { locale: string }) {
  const t = useTranslations('common');

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="master-column flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('siteName')}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex dark:text-gray-300">
          <Link href="/courses">{t('nav.courses')}</Link>
          <Link href="/articles">{t('nav.articles')}</Link>
          <Link href="/media">{t('nav.media')}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <SearchCommand locale={locale} />
          </div>
          <Button asChild size="sm">
            <Link href="/login">{t('nav.login')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
