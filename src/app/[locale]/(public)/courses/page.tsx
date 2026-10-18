import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageIntro } from '@/components/layout/ContentCard';
import { CourseCatalog } from '@/components/learning/CourseCatalog';
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

      <CourseCatalog
        empty={t('empty')}
        courses={courses.map((course) => {
          const hours = hoursLabel(course.hoursCredit);
          const track = course.track ? TRACK_META[course.track] : null;
          return {
            slug: course.slug,
            title: course.title,
            description: course.description,
            meta: [hours, track].filter(Boolean).join(' · ') || undefined,
          };
        })}
      />
    </div>
  );
}
