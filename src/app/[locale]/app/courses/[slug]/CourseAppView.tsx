'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { coursesApi, lessonsApi, enrollmentsApi } from '@/lib/api';
import type { CourseListItem, Lesson, Enrollment } from '@/types/api';

export function CourseAppView({ slug }: { slug: string }) {
  const t = useTranslations('app.course');
  const [course, setCourse] = useState<CourseListItem | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // The authenticated detail endpoint is by Mongo id, not slug — the
        // list endpoint returns full lean docs (including _id), so filter
        // client-side. Fine at this catalog size.
        const { courses } = await coursesApi.list({ limit: 100 });
        const found = courses.find((c) => c.slug === slug) ?? null;
        if (cancelled) return;
        setCourse(found);
        if (found) {
          const [{ lessons: courseLessons }, { enrollments }] = await Promise.all([
            lessonsApi.listForCourse(found._id),
            enrollmentsApi.list(),
          ]);
          if (cancelled) return;
          setLessons(courseLessons);
          const existing = enrollments.find((e) => {
            const c = typeof e.courseId === 'string' ? e.courseId : e.courseId._id;
            return c === found._id;
          });
          setEnrollment(existing ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const onEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      const { enrollment: created } = await enrollmentsApi.enroll(course._id);
      setEnrollment(created);
    } catch {
      toast.error('Unable to enroll right now.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!course) return <p className="text-gray-500">Course not found.</p>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-gray-900 dark:text-gray-100">{course.title}</h1>
      <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-300">{course.description}</p>

      {!enrollment ? (
        <Button onClick={onEnroll} disabled={enrolling} className="mt-6">
          {t('enroll')}
        </Button>
      ) : (
        <Badge variant="active" className="mt-6">
          {t('enrolled')}
        </Badge>
      )}

      {enrollment && (
        <>
          <h2 className="mt-8 text-lg font-medium text-gray-900 dark:text-gray-100">{t('lessons')}</h2>
          <ul className="mt-3 space-y-2">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link
                  href={`/app/courses/${slug}/lessons/${lesson.slug}`}
                  className="block rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm hover:shadow-card-hover dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                >
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-6">
            <Link href={`/app/courses/${slug}/quiz`}>{t('takeQuiz')}</Link>
          </Button>
        </>
      )}
    </div>
  );
}
