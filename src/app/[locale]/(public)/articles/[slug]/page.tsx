import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { formatDate } from '@/lib/utils';
import { publicArticlesApi } from '@/lib/api';
import { KNOWN_ARTICLE_SLUGS } from '@/lib/known-catalog';

export function generateStaticParams() {
  return KNOWN_ARTICLE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await publicArticlesApi.get(slug, locale).then((d) => d.article).catch(() => null);
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
  const article = await publicArticlesApi.get(slug, locale).then((d) => d.article).catch(() => null);
  if (!article) notFound();

  return (
    <article className="max-w-2xl">
      <div className="flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
            {tag}
          </span>
        ))}
      </div>
      <h2 className="mt-4 font-heading text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100">{article.title}</h2>
      {article.publishedAt && <p className="mt-2 text-sm text-gray-400">{formatDate(article.publishedAt)}</p>}
      <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">{article.body}</div>
    </article>
  );
}
