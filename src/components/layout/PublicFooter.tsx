import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function PublicFooter() {
  const t = useTranslations('common');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white py-10 dark:border-gray-800 dark:bg-gray-950">
      <div className="master-column flex flex-col gap-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading font-semibold text-gray-900 dark:text-gray-100">{t('siteName')}</p>
          <p className="mt-1 max-w-md">{t('footer.tagline')}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/courses">{t('nav.courses')}</Link>
          <Link href="/articles">{t('nav.articles')}</Link>
          <Link href="/login">{t('nav.login')}</Link>
        </div>
      </div>
      <p className="master-column mt-6 text-xs text-gray-400">
        © {year} WLKR. {t('footer.rights')}
      </p>
    </footer>
  );
}
