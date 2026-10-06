import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ContentCard } from '@/components/layout/ContentCard';
import { HomeStartCta } from '@/components/layout/HomeStartCta';
import { publicCoursesApi, publicArticlesApi, publicWebinarsApi } from '@/lib/api';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.home' });
  return { title: t('title'), description: t('description') };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.home');

  const [courses, articles, webinars] = await Promise.all([
    publicCoursesApi.list({ locale }).then((d) => d.courses).catch(() => []),
    publicArticlesApi.list({ locale }).then((d) => d.articles).catch(() => []),
    publicWebinarsApi.list().then((d) => d.webinars).catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">{t('hero.subtitle')}</p>

      {courses.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-heading text-lg font-medium text-gray-900 dark:text-gray-100">{t('coursesSection.title')}</h2>
            <Link href="/courses" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              {t('coursesSection.viewAll')}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <ContentCard
                key={course.slug}
                href={`/courses/${course.slug}`}
                title={course.title}
                description={course.description}
                kind="course"
              />
            ))}
          </div>
        </section>
      )}

      {webinars.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-heading text-lg font-medium text-gray-900 dark:text-gray-100">{t('webinarsSection.title')}</h2>
            <Link href="/webinars" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              {t('webinarsSection.viewAll')}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {webinars.slice(0, 3).map((webinar) => (
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
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-heading text-lg font-medium text-gray-900 dark:text-gray-100">{t('articlesSection.title')}</h2>
            <Link href="/articles" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              {t('articlesSection.viewAll')}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <ContentCard
                key={article.slug}
                href={`/articles/${article.slug}`}
                title={article.title}
                description={article.excerpt}
                kind="article"
              />
            ))}
          </div>
        </section>
      )}

      <HomeStartCta />
    </div>
  );
}
