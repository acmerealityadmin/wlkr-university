import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-static';

const BASE_URL = 'https://university.wlkr.ai';

// Hand-listed static routes, following wlkr-website's sitemap.ts pattern.
// Known launch content slugs — see scripts/seedUniversity.js in
// wlkr-ecko-server. If the catalog grows past a handful of items, switch to
// generateSitemaps() enumerating courses/articles from the public API at
// build time instead of hand-listing them here.
const STATIC_PATHS = ['', '/courses', '/articles', '/media', '/webinars'];
const COURSE_SLUGS = [
  'using-ai-in-k-8',
  'teaching-ai-with-wlkrai',
  'wlkr-in-30-minutes',
  'first-week-in-the-classroom',
  'district-admin-roster-and-clever',
];
const ARTICLE_SLUGS = ['anatomy-of-a-prompt', 'ai-basics-for-teachers', 'using-technology-in-the-classroom'];
const WEBINAR_SLUGS = ['ecko-office-hours', 'clever-go-live-clinic', 'infinity-and-school-hub-recording'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.8,
      });
    }
    for (const slug of COURSE_SLUGS) {
      entries.push({ url: `${BASE_URL}/${locale}/courses/${slug}`, lastModified, changeFrequency: 'monthly', priority: 0.7 });
    }
    for (const slug of ARTICLE_SLUGS) {
      entries.push({ url: `${BASE_URL}/${locale}/articles/${slug}`, lastModified, changeFrequency: 'monthly', priority: 0.6 });
    }
    for (const slug of WEBINAR_SLUGS) {
      entries.push({ url: `${BASE_URL}/${locale}/webinars/${slug}`, lastModified, changeFrequency: 'weekly', priority: 0.7 });
    }
  }

  return entries;
}
