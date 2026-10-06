'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { coursesApi, lessonsApi, enrollmentsApi } from '@/lib/api';
import { PracticeLinks } from '@/components/learning/PracticeLinks';
import { enrollmentForSlug, readEnrolledSlugs, rememberEnrolledSlug } from '@/components/learning/CourseEntryCta';
import { TrackBadge, hoursLabel } from '@/components/learning/TrackBadge';
import type { CourseListItem, Lesson, Enrollment } from '@/types/api';

export function CourseAppView({ slug }: { slug: string }) {
  const t = useTranslations('app.course');
  const [course, setCourse] = useState<CourseListItem | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [remembered, setRemembered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    setRemembered(readEnrolledSlugs().has(slug));
  }, [slug]);

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
          const existing = enrollmentForSlug(enrollments, slug, found._id);
          if (existing) {
            rememberEnrolledSlug(slug);
            setRemembered(true);
            setEnrollment(existing);
          } else {
            setEnrollment(null);
          }
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
      rememberEnrolledSlug(slug);
      setRemembered(true);
      setEnrollment(created);
    } catch {
      toast.error('Unable to enroll right now.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!course) return <p className="text-muted-foreground">Course not found.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <TrackBadge track={course.track} />
        {hoursLabel(course.hoursCredit) && (
          <Badge variant="outline">{hoursLabel(course.hoursCredit)}</Badge>
        )}
        {enrollment?.required && <Badge variant="draft">{t('required')}</Badge>}
      </div>
      <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100">{course.title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{course.description}</p>
      {course.competencyLine && (
        <p className="mt-2 max-w-2xl text-sm font-medium text-gray-700 dark:text-gray-300">{course.competencyLine}</p>
      )}
      {enrollment?.dueAt && (
        <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
          {t('dueAt')}: {new Date(enrollment.dueAt).toLocaleDateString()}
        </p>
      )}
      <PracticeLinks links={course.practiceLinks} title={t('practice')} />

      {!enrollment && !remembered ? (
        <Button onClick={onEnroll} disabled={enrolling} className="mt-6">
          {t('enroll')}
        </Button>
      ) : (
        <Badge variant="active" className="mt-6">
          {t('enrolled')}
        </Badge>
      )}

      {(enrollment || remembered) && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-foreground">{t('lessons')}</h2>
          <ul className="mt-3 space-y-2">
            {lessons.map((lesson) => (
              <li key={lesson.id || lesson._id || lesson.slug}>
                <Link
                  href={`/app/courses/${slug}/lessons/${lesson.slug}`}
                  className="block rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild className="mt-6">
            <Link href={`/app/courses/${slug}/understanding`}>{t('understanding')}</Link>
          </Button>
        </>
      )}
    </div>
  );
}
