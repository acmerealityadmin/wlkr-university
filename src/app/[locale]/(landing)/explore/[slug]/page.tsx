import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  Check,
  Compass,
  FileText,
  Film,
  Gamepad2,
  LineChart,
  MessageCircle,
  Presentation,
  Search,
  ShieldCheck,
  Sparkles,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { EXPLORE_PAGES, explorePage, type ExplorePage } from '@/lib/explore';
import { cn } from '@/lib/utils';

const FEATURE_ICONS: Record<ExplorePage['key'], LucideIcon[]> = {
  webinars: [Video, CalendarClock, MessageCircle],
  wlkrLearning: [Gamepad2, Compass, Presentation],
  mediaLibrary: [Film, FileText, Search],
  analytics: [BarChart3, LineChart, ShieldCheck],
};

const CARD_ICONS: Record<ExplorePage['key'], LucideIcon> = {
  webinars: Video,
  wlkrLearning: Gamepad2,
  mediaLibrary: BookOpen,
  analytics: BarChart3,
};

const TONES = [
  'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
];

export function generateStaticParams() {
  return EXPLORE_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = explorePage(slug);
  if (!page) return {};
  const t = await getTranslations({ locale, namespace: `public.explore.${page.key}` });
  return { title: t('title'), description: t('subtitle') };
}

export default async function ExploreDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = explorePage(slug);
  if (!page) notFound();

  const t = await getTranslations(`public.explore.${page.key}`);
  const shared = await getTranslations('public.explore');
  const icons = FEATURE_ICONS[page.key];
  const others = EXPLORE_PAGES.filter((other) => other.slug !== page.slug);

  return (
    <>
      <section className="relative isolate overflow-hidden min-h-[720px] lg:min-h-[820px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-[center_bottom]"
          style={{ backgroundImage: `url('${page.image}')` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-950/80 via-brand-950/45 via-50% to-transparent"
          aria-hidden
        />
        <LandingHeader />
        <div className="mx-auto max-w-3xl px-5 pt-36 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-[#e9d49a] backdrop-blur">
            <Sparkles className="h-4 w-4" />
            {t('eyebrow')}
          </span>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight text-white drop-shadow sm:text-5xl">{t('title')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow sm:text-xl">{t('subtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-14 items-center rounded-full bg-[#c9a24b] px-8 text-lg font-bold text-brand-950 shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-[#d6b25f]"
            >
              {shared('createAccount')}
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center rounded-full border-2 border-white/70 px-8 text-lg font-bold text-white transition-colors hover:bg-white/10"
            >
              {shared('login')}
            </Link>
          </div>
        </div>
      </section>

      <div className="app-backdrop">
        <div className="mx-auto max-w-6xl space-y-16 px-5 py-16 lg:px-10 lg:py-20">
          <section>
            <h2 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100 sm:text-4xl">{t('featuresTitle')}</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-3">
              {icons.map((Icon, i) => (
                <article
                  key={i}
                  className="rounded-3xl border border-gray-100 bg-white p-7 shadow-soft dark:border-gray-800 dark:bg-gray-900"
                >
                  <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', TONES[i])}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-semibold text-gray-900 dark:text-gray-100">{t(`features.${i}.title`)}</h3>
                  <p className="mt-2 text-base leading-relaxed text-gray-500 dark:text-gray-400">{t(`features.${i}.body`)}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid items-start gap-8 rounded-[2rem] bg-white p-8 shadow-soft dark:bg-gray-900 lg:grid-cols-[1.3fr_1fr] lg:p-10">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{t('detailTitle')}</h2>
              <p className="mt-3 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{t('detailBody')}</p>
              <ul className="mt-6 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="flex gap-3 text-base text-gray-700 dark:text-gray-300">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <Check className="h-4 w-4" />
                    </span>
                    {t(`points.${i}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 p-8 text-white shadow-lift">
              <p className="text-sm font-bold uppercase tracking-wider text-[#e9d49a]">{shared('includedIn')}</p>
              <p className="mt-2 font-heading text-3xl font-semibold">{t('plan')}</p>
              <p className="mt-3 text-base leading-relaxed text-white/80">{t('planNote')}</p>
              <Link
                href="/signup"
                className="mt-6 inline-flex h-12 items-center rounded-full bg-white px-6 text-base font-bold text-brand-900 transition-transform hover:-translate-y-0.5"
              >
                {shared('seePlans')}
              </Link>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{shared('moreTitle')}</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-3">
              {others.map((other) => {
                const Icon = CARD_ICONS[other.key];
                return (
                  <Link
                    key={other.slug}
                    href={`/explore/${other.slug}`}
                    className="group flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift dark:border-gray-800 dark:bg-gray-900"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-heading text-lg font-semibold text-gray-900 group-hover:text-brand-600 dark:text-gray-100">
                      {shared(`names.${other.key}`)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
