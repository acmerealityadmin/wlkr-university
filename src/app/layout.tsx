import type { Metadata } from 'next';

// Root layout for the one route outside [locale]: the bare `/` redirect
// entry point (src/app/page.tsx). All real pages live under
// src/app/[locale]/, which has its own full <html>/<body>/font/i18n layout.
export const metadata: Metadata = {
  title: 'WLKR University',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
