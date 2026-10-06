import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthAwareCta } from '@/components/layout/AuthAwareCta';

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
    <div className="max-w-lg">
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('comingSoon')}</p>
      <AuthAwareCta
        className="mt-6"
        guestLabel={tCommon('nav.login')}
        signedInHref="/app/dashboard"
        signedInLabel={tCommon('nav.dashboard')}
      />
    </div>
  );
}
