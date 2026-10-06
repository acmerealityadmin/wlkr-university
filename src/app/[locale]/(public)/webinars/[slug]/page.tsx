import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AuthAwareCta } from '@/components/layout/AuthAwareCta';
import { publicWebinarsApi } from '@/lib/api';
import { KNOWN_WEBINAR_SLUGS } from '@/lib/known-catalog';
import { hoursLabel } from '@/components/learning/TrackBadge';

export function generateStaticParams() {
  return KNOWN_WEBINAR_SLUGS.map((slug) => ({ slug }));
}

async function findWebinar(slug: string) {
  const webinars = await publicWebinarsApi.list().then((d) => d.webinars).catch(() => []);
  return webinars.find((w) => w.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const webinar = await findWebinar(slug);
  if (!webinar) return {};
  return { title: webinar.title, description: webinar.description };
}

export default async function PublicWebinarDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.webinars');
  const webinar = await findWebinar(slug);
  if (!webinar) notFound();
  const hours = hoursLabel(webinar.hoursCredit);

  return (
    <div className="max-w-2xl">
      <Link href="/webinars" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        ← {t('back')}
      </Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {webinar.kind === 'office_hours' ? t('officeHours') : t('webinar')}
        {hours ? ` · ${hours}` : ''}
      </p>
      <h2 className="mt-2 font-heading text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100">
        {webinar.title}
      </h2>
      {webinar.hostName && <p className="mt-1 text-sm text-gray-500">{webinar.hostName}</p>}
      <p className="mt-2 text-sm text-gray-500">{new Date(webinar.startsAt).toLocaleString()}</p>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {webinar.description}
      </p>
      {webinar.recordingUrl && (
        <p className="mt-4">
          <a
            href={webinar.recordingUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            {t('watchRecording')}
          </a>
        </p>
      )}
      {webinar.relatedArticleSlug && (
        <p className="mt-3">
          <Link href={`/articles/${webinar.relatedArticleSlug}`} className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
            {t('relatedArticle')}
          </Link>
        </p>
      )}
      <AuthAwareCta
        className="mt-6"
        guestLabel={t('loginCta')}
        signedInHref={`/app/webinars/${slug}`}
        signedInLabel={t('loginCtaSignedIn')}
      />
    </div>
  );
}
