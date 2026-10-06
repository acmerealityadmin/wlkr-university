import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CourseEntryCta } from '@/components/learning/CourseEntryCta';
import { publicCoursesApi } from '@/lib/api';
import { PracticeLinks } from '@/components/learning/PracticeLinks';
import { hoursLabel } from '@/components/learning/TrackBadge';
import { KNOWN_COURSE_SLUGS } from '@/lib/known-catalog';

export function generateStaticParams() {
  return KNOWN_COURSE_SLUGS.map((slug) => ({ slug }));
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
  const course = await findCourse(slug, locale);
  if (!course) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap gap-2">
        {course.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
            {tag}
          </span>
        ))}
      </div>
      <h2 className="mt-4 font-heading text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100">{course.title}</h2>
      {hoursLabel(course.hoursCredit) && (
        <p className="mt-2 text-sm text-gray-500">{hoursLabel(course.hoursCredit)}</p>
      )}
      {course.competencyLine && (
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{course.competencyLine}</p>
      )}
      <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">{course.description}</p>
      <PracticeLinks links={course.practiceLinks} />
      <CourseEntryCta slug={slug} />
    </div>
  );
}
