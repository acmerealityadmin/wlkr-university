export const BLOG_CATEGORY_SLUGS = [
  'wlkr-learning',
  'ai',
  'critical-thinking',
  'decision-making',
  'professional-development',
] as const;

export type BlogCategorySlug = (typeof BLOG_CATEGORY_SLUGS)[number];

export function isBlogCategory(value: string): value is BlogCategorySlug {
  return (BLOG_CATEGORY_SLUGS as readonly string[]).includes(value);
}
