import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { publicCoursesApi } from '@/lib/api';

// The public API only exposes a LIST endpoint (no /public/courses/:slug) —
// fetch the catalog and find by slug. Fine at this catalog size; revisit if
// it grows. Known launch slugs hardcoded here so `next build` (static
// export) doesn't require network access to enumerate params — see
// scripts/seedUniversity.js in wlkr-ecko-server for the source of truth.
const KNOWN_SLUGS = ['using-ai-in-k-8', 'teaching-ai-with-wlkrai'];

export function generateStaticParams() {
  return KNOWN_SLUGS.map((slug) => ({ slug }));
}

async function findCourse(slug: string, locale: string) {
  const courses = await publicCoursesApi.list({ locale }).then((d) => d.courses).catch(() => []);
  return courses.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = await findCourse(slug, locale);
  if (!course) return {};
  return {
    title: course.title,
    description: course.description,
    openGraph: { title: course.title, description: course.description },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.courses');
  const course = await findCourse(slug, locale);
  if (!course) notFound();

  return (
    <div className="master-column py-16">
      <div className="flex flex-wrap gap-2">
        {course.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
            {tag}
          </span>
        ))}
      </div>
      <h1 className="mt-4 font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{course.title}</h1>
      <p className="mt-4 max-w-2xl whitespace-pre-line text-gray-600 dark:text-gray-300">{course.description}</p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/login">{t('enrollCta')}</Link>
      </Button>
    </div>
  );
}
