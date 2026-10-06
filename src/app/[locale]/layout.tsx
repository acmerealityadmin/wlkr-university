import type { Metadata } from 'next';
import { Roboto, Roboto_Slab } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type AppLocale } from '@/i18n/routing';
import { NativeBootstrap } from '@/components/NativeBootstrap';
import { Providers } from '@/components/providers';
import '../globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
});
const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-heading',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_DESCRIPTION = 'Professional development for educators using the WLKR Learning System.';

export const metadata: Metadata = {
  metadataBase: new URL('https://university.wlkr.ai'),
  title: { default: 'WLKR University', template: '%s | WLKR University' },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'WLKR University',
    title: 'WLKR University',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WLKR University',
    description: SITE_DESCRIPTION,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as AppLocale)) notFound();

  // Enables static rendering for this locale segment during `next build`.
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${roboto.variable} ${robotoSlab.variable} font-sans font-medium antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <NativeBootstrap />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
