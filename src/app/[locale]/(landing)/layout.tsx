import { setRequestLocale } from 'next-intl/server';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default async function LandingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to main content
      </a>
      <div className="flex min-h-screen flex-col bg-background">
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <LandingFooter locale={locale} />
      </div>
    </>
  );
}
