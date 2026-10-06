import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthAwareCta } from '@/components/layout/AuthAwareCta';
import { ContentCard, PageIntro } from '@/components/layout/ContentCard';
import { publicWebinarsApi } from '@/lib/api';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.webinars' });
  return { title: t('title'), description: t('description') };
}

export default async function PublicWebinarsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.webinars');
  const webinars = await publicWebinarsApi.list().then((d) => d.webinars).catch(() => []);
  const upcoming = webinars.filter((w) => w.upcoming);
  const past = webinars.filter((w) => !w.upcoming);

  return (
    <div>
      <PageIntro description={t('description')} />
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('upcoming')}</h2>
      {upcoming.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">{t('emptyUpcoming')}</p>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {upcoming.map((webinar) => (
            <ContentCard
              key={webinar.slug}
              href={`/webinars/${webinar.slug}`}
              title={webinar.title}
              description={webinar.description}
              meta={new Date(webinar.startsAt).toLocaleString()}
              kind="course"
            />
          ))}
        </div>
      )}
      <h2 className="mt-10 text-lg font-medium text-gray-900 dark:text-gray-100">{t('recordings')}</h2>
      {past.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">{t('emptyPast')}</p>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {past.map((webinar) => (
            <ContentCard
              key={webinar.slug}
              href={`/webinars/${webinar.slug}`}
              title={webinar.title}
              description={webinar.description}
              meta={t('recordingAvailable')}
              kind="article"
            />
          ))}
        </div>
      )}
      <p className="mt-8 text-sm text-gray-500">
        <AuthAwareCta
          variant="link"
          className="font-medium text-brand-700 hover:underline dark:text-brand-300"
          guestLabel={t('loginCta')}
          signedInHref="/app/webinars"
          signedInLabel={t('loginCtaSignedIn')}
        />
      </p>
    </div>
  );
}
