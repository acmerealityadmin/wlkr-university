import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// One codebase, two release channels: this same `out/` static export is
// served as the web app AND wrapped by Capacitor for the app-store build
// (mirrors wlkr-field-app's next.config.ts). The gated LMS pages are
// client-rendered against wlkr-ecko-server (proven pattern in wlkr-ed-portal);
// the public SEO pages get static metadata/OG/sitemap at build time via
// generateMetadata/generateStaticParams, which is fully crawlable without a
// running Node server. Publishing new content triggers a rebuild+redeploy.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
