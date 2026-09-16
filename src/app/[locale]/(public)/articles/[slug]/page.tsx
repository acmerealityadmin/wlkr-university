import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { formatDate } from '@/lib/utils';
import { publicArticlesApi } from '@/lib/api';

// Known launch slugs — see scripts/seedUniversity.js in wlkr-ecko-server.
const KNOWN_SLUGS = ['anatomy-of-a-prompt', 'ai-basics-for-teachers', 'using-technology-in-the-classroom'];

export function generateStaticParams() {
  return KNOWN_SLUGS.map((slug) => ({ slug }));
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
    <article className="master-column max-w-2xl py-16">
      <div className="flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
            {tag}
          </span>
        ))}
      </div>
      <h1 className="mt-4 font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{article.title}</h1>
      {article.publishedAt && <p className="mt-2 text-sm text-gray-400">{formatDate(article.publishedAt)}</p>}
      <div className="mt-8 max-w-none whitespace-pre-line text-gray-700 leading-relaxed dark:text-gray-300">{article.body}</div>
    </article>
  );
}
