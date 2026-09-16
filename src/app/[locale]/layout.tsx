import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type AppLocale } from '@/i18n/routing';
import { NativeBootstrap } from '@/components/NativeBootstrap';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });

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
      <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <NativeBootstrap />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
