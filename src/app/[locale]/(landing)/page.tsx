import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BarChart3, Gamepad2, PlayCircle, Video } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingCard, type LandingLink } from '@/components/landing/LandingCard';
import { FeaturedBlogs } from '@/components/landing/FeaturedBlogs';
import { UniversityCrest } from '@/components/landing/UniversityCrest';
import type { LucideIcon } from 'lucide-react';

const TONES = {
  navy: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  blue: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
};

type CardData = {
  icon: LucideIcon;
  tone: string;
  eyebrow?: string;
  title: string;
  description: string;
  links: LandingLink[];
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.home' });
  return { title: t('title'), description: t('description') };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.landing');

  const infoCards: CardData[] = [
    {
      icon: Video,
      tone: TONES.blue,
      title: t('info.webinars.title'),
      description: t('info.webinars.body'),
      links: [{ label: t('info.learnMore'), href: '/explore/webinars' }],
    },
    {
      icon: Gamepad2,
      tone: TONES.navy,
      title: t('info.wlkrLearning.title'),
      description: t('info.wlkrLearning.body'),
      links: [{ label: t('info.learnMore'), href: '/explore/wlkr-learning' }],
    },
    {
      icon: PlayCircle,
      tone: TONES.green,
      title: t('info.mediaLibrary.title'),
      description: t('info.mediaLibrary.body'),
      links: [{ label: t('info.learnMore'), href: '/explore/media-library' }],
    },
    {
      icon: BarChart3,
      tone: TONES.amber,
      title: t('info.analytics.title'),
      description: t('info.analytics.body'),
      links: [{ label: t('info.learnMore'), href: '/explore/analytics' }],
    },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden min-h-[720px] lg:min-h-[880px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-[center_bottom]"
          style={{ backgroundImage: "url('/images/campus-hero.jpg')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-950/80 via-brand-950/45 via-55% to-transparent"
          aria-hidden
        />
        <LandingHeader />
        <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-28 text-center lg:pb-72">
          <UniversityCrest />
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/90 drop-shadow sm:text-xl">{t('hero.subtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-14 items-center rounded-full bg-[#c9a24b] px-8 text-lg font-bold text-brand-950 shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-[#d6b25f]"
            >
              {t('hero.cta')}
            </Link>
            <Link
              href="/articles"
              className="inline-flex h-14 items-center rounded-full border-2 border-white/70 px-8 text-lg font-bold text-white transition-colors hover:bg-white/10"
            >
              {t('hero.secondaryCta')}
            </Link>
          </div>
        </div>
      </section>

      <div className="app-backdrop">
        <div className="mx-auto max-w-7xl space-y-16 px-5 py-16 lg:px-10 lg:py-20">
          <LandingRow title={t('info.title')} subtitle={t('info.subtitle')} cards={infoCards} />
          <FeaturedBlogs />
        </div>
      </div>
    </>
  );
}

function LandingRow({
  title,
  subtitle,
  cards,
  action,
}: {
  title: string;
  subtitle: string;
  cards: CardData[];
  action?: { label: string; href: string };
}) {
  return (
    <section>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100 sm:text-4xl">{title}</h2>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        {action && (
          <Link href={action.href} className="text-base font-bold text-brand-600 hover:underline dark:text-brand-300">
            {action.label}
          </Link>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 xl:gap-6">
        {cards.map((card) => (
          <LandingCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
