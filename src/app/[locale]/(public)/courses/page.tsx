import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContentCard, PageIntro } from '@/components/layout/ContentCard';
import { publicCoursesApi } from '@/lib/api';
import { hoursLabel } from '@/components/learning/TrackBadge';

const TRACK_META: Record<string, string> = {
  teacher: 'Teachers',
  admin: 'Admins',
  first_30_days: 'First 30 days',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.courses' });
  return { title: t('title'), description: t('description') };
}

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.courses');
  const courses = await publicCoursesApi.list({ locale }).then((d) => d.courses).catch(() => []);

  return (
    <div>
      <PageIntro description={t('description')} />

      {courses.length === 0 ? (
        <p className="text-sm text-gray-500">{t('empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const hours = hoursLabel(course.hoursCredit);
            const track = course.track ? TRACK_META[course.track] : null;
            const meta = [hours, track].filter(Boolean).join(' · ') || undefined;
            return (
            <ContentCard
              key={course.slug}
              href={`/courses/${course.slug}`}
              title={course.title}
              description={course.description}
              meta={meta}
              kind="course"
            />
            );
          })}
        </div>
      )}
    </div>
  );
}
