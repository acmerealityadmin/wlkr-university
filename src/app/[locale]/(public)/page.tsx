import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { publicCoursesApi, publicArticlesApi } from '@/lib/api';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.home' });
  return { title: t('title'), description: t('description') };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.home');

  // Build-time fetch against wlkr-ecko-server's public endpoints. Falls back
  // to empty state if the API isn't reachable at build time — new
  // courses/articles show up on the next rebuild+redeploy.
  const [courses, articles] = await Promise.all([
    publicCoursesApi.list({ locale }).then((d) => d.courses).catch(() => []),
    publicArticlesApi.list({ locale }).then((d) => d.articles).catch(() => []),
  ]);

  return (
    <div>
      <section className="master-column py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{t('hero.eyebrow')}</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-gray-900 sm:text-5xl dark:text-gray-100">
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('hero.subtitle')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/courses">{t('hero.cta')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/articles">{t('hero.secondaryCta')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {courses.length > 0 && (
        <section className="master-column py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('coursesSection.title')}</h2>
            <Link href="/courses" className="text-sm font-medium text-brand-600 hover:underline">
              {t('coursesSection.viewAll')}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <Link key={course.slug} href={`/courses/${course.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-card-hover">
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="master-column py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('articlesSection.title')}</h2>
            <Link href="/articles" className="text-sm font-medium text-brand-600 hover:underline">
              {t('articlesSection.viewAll')}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <Link key={article.slug} href={`/articles/${article.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-card-hover">
                  <CardHeader>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{article.excerpt}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-gray-100 bg-brand-50/50 py-16 dark:border-gray-800 dark:bg-brand-950/10">
        <div className="master-column text-center">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('cta.title')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{t('cta.subtitle')}</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/login">{t('cta.button')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
