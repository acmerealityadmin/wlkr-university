export const EXPLORE_PAGES = [
  { slug: 'webinars', key: 'webinars', image: '/images/explore-webinars.jpg' },
  { slug: 'wlkr-learning', key: 'wlkrLearning', image: '/images/explore-wlkr-learning.jpg' },
  { slug: 'media-library', key: 'mediaLibrary', image: '/images/explore-media-library.jpg' },
  { slug: 'analytics', key: 'analytics', image: '/images/explore-analytics.jpg' },
] as const;

export type ExplorePage = (typeof EXPLORE_PAGES)[number];

export function explorePage(slug: string): ExplorePage | undefined {
  return EXPLORE_PAGES.find((page) => page.slug === slug);
}
