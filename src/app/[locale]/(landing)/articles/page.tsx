import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { BlogCatalog } from '@/components/blog/BlogCatalog';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.articles' });
  return { title: t('title'), description: t('description') };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.articles');

  return (
    <>
      <section className="relative isolate overflow-hidden min-h-[680px] lg:min-h-[780px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-[center_bottom]"
          style={{ backgroundImage: "url('/images/blog-hero.jpg')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-950/80 via-brand-950/45 via-50% to-transparent"
          aria-hidden
        />
        <LandingHeader />
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-36 text-center lg:pb-48">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e9d49a]">{t('heroEyebrow')}</p>
          <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-white drop-shadow sm:text-5xl">{t('heroTitle')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow">{t('heroSubtitle')}</p>
        </div>
      </section>

      <div className="app-backdrop">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-10 lg:py-20">
          <BlogCatalog />
        </div>
      </div>
    </>
  );
}
