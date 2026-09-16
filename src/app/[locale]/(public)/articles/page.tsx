import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { publicArticlesApi } from '@/lib/api';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.articles' });
  return { title: t('title'), description: t('description') };
}

export default async function ArticlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.articles');
  const articles = await publicArticlesApi.list({ locale }).then((d) => d.articles).catch(() => []);

  return (
    <div className="master-column py-16">
      <h1 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h1>
      <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-300">{t('description')}</p>

      {articles.length === 0 ? (
        <p className="mt-10 text-gray-500">{t('empty')}</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-card-hover">
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{article.excerpt}</CardDescription>
                  {article.publishedAt && (
                    <p className="pt-1 text-xs text-gray-400">{formatDate(article.publishedAt)}</p>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
