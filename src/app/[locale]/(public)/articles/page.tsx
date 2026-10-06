import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { formatDate } from '@/lib/utils';
import { ContentCard, PageIntro } from '@/components/layout/ContentCard';
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
    <div>
      <PageIntro description={t('description')} />

      {articles.length === 0 ? (
        <p className="text-sm text-gray-500">{t('empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ContentCard
              key={article.slug}
              href={`/articles/${article.slug}`}
              title={article.title}
              description={article.excerpt}
              meta={article.publishedAt ? formatDate(article.publishedAt) : undefined}
              kind="article"
            />
          ))}
        </div>
      )}
    </div>
  );
}
