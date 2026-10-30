import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { BlogMarkdown } from '@/components/blog/BlogMarkdown';
import { Link } from '@/i18n/navigation';
import { publicArticlesApi } from '@/lib/api';
import { isBlogCategory } from '@/lib/blogCategories';
import { KNOWN_ARTICLE_SLUGS } from '@/lib/known-catalog';
import { formatDate } from '@/lib/utils';

export async function generateStaticParams() {
  const fromApi = await publicArticlesApi
    .list({ limit: 100 })
    .then((data) => data.articles.map((article) => article.slug))
    .catch(() => [] as string[]);
  return [...new Set([...KNOWN_ARTICLE_SLUGS, ...fromApi])].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await publicArticlesApi.get(slug, locale).then((data) => data.article).catch(() => null);
  if (!article) return {};
  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    openGraph: { title: article.title, description: article.excerpt },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.articles');
  const article = await publicArticlesApi.get(slug, locale).then((data) => data.article).catch(() => null);
  if (!article) notFound();

  return (
    <>
      <div className="relative h-24 bg-brand-950">
        <LandingHeader />
      </div>
      <div className="app-backdrop">
        <article className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
          <Link href="/articles" className="text-sm font-bold text-brand-600 hover:underline dark:text-brand-300">
            {t('back')}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {isBlogCategory(article.category) && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
                {t(`categories.${article.category}`)}
              </span>
            )}
            {article.publishedAt && <span className="text-sm text-gray-400">{formatDate(article.publishedAt)}</span>}
          </div>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            {article.title}
          </h1>
          {article.excerpt && <p className="mt-4 text-lg leading-relaxed text-gray-500 dark:text-gray-400">{article.excerpt}</p>}
          {article.coverImageUrl && (
            <img src={article.coverImageUrl} alt={article.title} className="mt-8 w-full rounded-3xl object-cover" />
          )}
          <div className="mt-8">
            <BlogMarkdown source={article.body} />
          </div>
        </article>
      </div>
    </>
  );
}
