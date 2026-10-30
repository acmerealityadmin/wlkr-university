'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Building2, GraduationCap, LifeBuoy, Newspaper, type LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LandingCard, type LandingLink } from '@/components/landing/LandingCard';
import { publicBlogApi } from '@/lib/api';
import { isBlogCategory } from '@/lib/blogCategories';

const SITE = 'https://wlkrlearning.com';

const TONES = [
  'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
];

type CardData = {
  key: string;
  icon: LucideIcon;
  tone: string;
  eyebrow?: string;
  title: string;
  description: string;
  links: LandingLink[];
};

export function FeaturedBlogs() {
  const t = useTranslations('public.landing');
  const articlesT = useTranslations('public.articles');
  const locale = useLocale();
  const [cards, setCards] = useState<CardData[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fallbackCards: CardData[] = [
      {
        key: 'fallback-articles',
        icon: BookOpen,
        tone: TONES[0],
        eyebrow: t('blog.eyebrow'),
        title: t('fallback.articles.title'),
        description: t('fallback.articles.body'),
        links: [{ label: t('fallback.articles.link'), href: '/articles' }],
      },
      {
        key: 'fallback-schools',
        icon: Building2,
        tone: TONES[1],
        eyebrow: t('fallback.eyebrow'),
        title: t('fallback.schools.title'),
        description: t('fallback.schools.body'),
        links: [{ label: t('fallback.schools.link'), href: `${SITE}/schools`, external: true }],
      },
      {
        key: 'fallback-about',
        icon: GraduationCap,
        tone: TONES[2],
        eyebrow: t('fallback.eyebrow'),
        title: t('fallback.about.title'),
        description: t('fallback.about.body'),
        links: [{ label: t('fallback.about.link'), href: `${SITE}/educators`, external: true }],
      },
      {
        key: 'fallback-help',
        icon: LifeBuoy,
        tone: TONES[3],
        eyebrow: t('fallback.eyebrow'),
        title: t('fallback.help.title'),
        description: t('fallback.help.body'),
        links: [{ label: t('fallback.help.link'), href: `${SITE}/#contact`, external: true }],
      },
    ];

    publicBlogApi.featured(locale)
      .then((data) => {
        if (cancelled) return;
        if (!data.featured.length) {
          setCards(fallbackCards);
          return;
        }
        setCards(data.featured.map((post, index) => ({
          key: post.slug,
          icon: Newspaper,
          tone: TONES[index % TONES.length],
          eyebrow: isBlogCategory(post.category) ? articlesT(`categories.${post.category}`) : t('blog.eyebrow'),
          title: post.title,
          description: post.excerpt,
          links: [{ label: t('blog.read'), href: `/articles/${post.slug}` }],
        })));
      })
      .catch(() => {
        if (!cancelled) setCards(fallbackCards);
      });
    return () => { cancelled = true; };
  }, [articlesT, locale, t]);

  return (
    <section>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100 sm:text-4xl">{t('blog.title')}</h2>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{t('blog.subtitle')}</p>
        </div>
        <Link href="/articles" className="text-base font-bold text-brand-600 hover:underline dark:text-brand-300">
          {t('blog.viewAll')}
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 xl:gap-6">
        {(cards ?? [0, 1, 2, 3]).map((card) => (
          typeof card === 'number' ? (
            <div key={card} className="h-64 animate-pulse rounded-3xl bg-white/80 dark:bg-gray-900" />
          ) : (
            <LandingCard key={card.key} icon={card.icon} tone={card.tone} eyebrow={card.eyebrow} title={card.title} description={card.description} links={card.links} />
          )
        ))}
      </div>
    </section>
  );
}
