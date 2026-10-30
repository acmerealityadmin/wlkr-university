'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { publicArticlesApi } from '@/lib/api';
import { BLOG_CATEGORY_SLUGS, isBlogCategory } from '@/lib/blogCategories';
import { formatDate } from '@/lib/utils';
import type { PublicArticleListItem } from '@/types/api';

export function BlogCatalog() {
  const t = useTranslations('public.articles');
  const locale = useLocale();
  const [posts, setPosts] = useState<PublicArticleListItem[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    publicArticlesApi.list({ locale, limit: 100 })
      .then((data) => {
        if (!cancelled) setPosts(data.articles);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [locale]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (category && post.category !== category) return false;
      if (!needle) return true;
      const haystack = [post.title, post.excerpt, post.slug, ...(post.tags || [])].join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }, [posts, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-soft dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <label className="relative block">
          <span className="sr-only">{t('searchPlaceholder')}</span>
          <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-12 w-full rounded-full border border-gray-200 bg-gray-50 ps-11 pe-4 text-base text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <CategoryChip active={category === ''} onClick={() => setCategory('')}>
            {t('allCategories')}
          </CategoryChip>
          {BLOG_CATEGORY_SLUGS.map((slug) => (
            <CategoryChip key={slug} active={category === slug} onClick={() => setCategory(slug)}>
              {t(`categories.${slug}`)}
            </CategoryChip>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-3xl bg-white/70 dark:bg-gray-900" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">{posts.length === 0 ? t('empty') : t('emptyFiltered')}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {visible.map((post) => (
            <Link
              key={post.slug}
              href={`/articles/${post.slug}`}
              className="group flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                {isBlogCategory(post.category) && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
                    {t(`categories.${post.category}`)}
                  </span>
                )}
                {post.publishedAt && <span className="text-xs text-gray-400">{formatDate(post.publishedAt)}</span>}
              </div>
              <h2 className="mt-3 font-heading text-xl font-semibold text-gray-900 group-hover:text-brand-700 dark:text-gray-100 dark:group-hover:text-brand-300">
                {post.title}
              </h2>
              {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{post.excerpt}</p>}
              <span className="mt-4 text-sm font-bold text-brand-600 dark:text-brand-300">{t('readMore')}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white'
          : 'rounded-full bg-gray-100 px-3.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
      }
    >
      {children}
    </button>
  );
}
