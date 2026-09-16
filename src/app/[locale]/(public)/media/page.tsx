import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.media' });
  return { title: t('title'), description: t('description') };
}

// GAP: wlkr-ecko-server's /v1/university/media route is educator-authenticated
// only (requireMinRole('TEACHER')) — there is no public media endpoint yet, so
// this page cannot list real items. A public, link-whitelisted media route
// (mirroring src/routes/catalogMedia.js's pattern) would need to be added to
// ecko-server before this can show real content.
export default async function MediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.media');
  const tCommon = await getTranslations('common');

  return (
    <div className="master-column py-16 text-center">
      <h1 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h1>
      <p className="mx-auto mt-4 max-w-md text-gray-600 dark:text-gray-300">{t('comingSoon')}</p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/login">{tCommon('nav.login')}</Link>
      </Button>
    </div>
  );
}
