'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { coursesApi, lessonsApi, enrollmentsApi, quizzesApi } from '@/lib/api';
import { PracticeLinks } from '@/components/learning/PracticeLinks';
import { enrollmentForSlug, readEnrolledSlugs, rememberEnrolledSlug } from '@/components/learning/CourseEntryCta';
import { TrackBadge, hoursLabel } from '@/components/learning/TrackBadge';
import { localizeCourse, localizeLesson, localizeQuiz } from '@/lib/localizedContent';
import type { CourseListItem, Lesson, Enrollment, Quiz } from '@/types/api';

function lessonKey(lesson: Lesson) {
  return String(lesson.id || lesson._id || '');
}

function attachedQuizzes(lessonId: string, quizzes: Quiz[]) {
  return quizzes.filter((quiz) => quiz.placement === 'after_lesson' && quiz.lessonId === lessonId);
}

function lessonTiming(lesson: Lesson, lessonCount: number, hoursCredit?: number | null) {
  if (lesson.approxMinutes && lesson.approxMinutes > 0) {
    return { minutes: lesson.approxMinutes, estimated: false };
  }
  const hours = Number(hoursCredit) || 0;
  if (hours > 0 && lessonCount > 0) {
    return { minutes: Math.max(1, Math.round((hours * 60) / lessonCount)), estimated: true };
  }
  return { minutes: null, estimated: false };
}

type OutlineRow =
  | { key: string; kind: 'quiz'; title: string; href: string }
  | { key: string; kind: 'lesson'; lesson: Lesson; href: string; quizzes: Quiz[]; minutes: number | null; estimated: boolean };

function courseOutline(slug: string, lessons: Lesson[], quizzes: Quiz[], hoursCredit?: number | null): OutlineRow[] {
  const ordered = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const knownIds = new Set(ordered.map(lessonKey).filter(Boolean));
  const quizRow = (quiz: Quiz): OutlineRow => ({
    key: `quiz-${quiz.id}`,
    kind: 'quiz',
    title: quiz.title,
    href: `/app/courses/${slug}/quizzes?quiz=${quiz.id}`,
  });
  const rows: OutlineRow[] = [];
  quizzes.filter((quiz) => quiz.placement === 'start').forEach((quiz) => rows.push(quizRow(quiz)));
  for (const lesson of ordered) {
    const id = lessonKey(lesson);
    rows.push({
      key: `lesson-${id || lesson.slug}`,
      kind: 'lesson',
      lesson,
      href: `/app/courses/${slug}/lessons/${lesson.slug}`,
      quizzes: attachedQuizzes(id, quizzes),
      ...lessonTiming(lesson, ordered.length, hoursCredit),
    });
  }
  quizzes
    .filter((quiz) => quiz.placement !== 'start' && quiz.placement !== 'after_lesson')
    .forEach((quiz) => rows.push(quizRow(quiz)));
  quizzes
    .filter((quiz) => quiz.placement === 'after_lesson' && !knownIds.has(String(quiz.lessonId || '')))
    .forEach((quiz) => rows.push(quizRow(quiz)));
  return rows;
}

export function CourseAppView({ slug }: { slug: string }) {
  const t = useTranslations('app.course');
  const locale = useLocale();
  const [course, setCourse] = useState<CourseListItem | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
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
        const { courses } = await coursesApi.listCatalog();
        const found = courses.find((c) => c.slug === slug) ?? null;
        if (cancelled) return;
        setCourse(found);
        if (found) {
          const [{ lessons: courseLessons }, { enrollments }, { quizzes: courseQuizzes }] = await Promise.all([
            lessonsApi.listForCourse(found._id),
            enrollmentsApi.list(),
            quizzesApi.listForCourse(found._id),
          ]);
          if (cancelled) return;
          setLessons(courseLessons);
          setQuizzes(courseQuizzes);
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

  const shown = localizeCourse(course, locale);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <TrackBadge track={course.track} />
        {hoursLabel(course.hoursCredit) && (
          <Badge variant="outline">{hoursLabel(course.hoursCredit)}</Badge>
        )}
        {enrollment?.required && <Badge variant="draft">{t('required')}</Badge>}
      </div>
      <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100">{shown.title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{shown.description}</p>
      {shown.competencyLine && (
        <p className="mt-2 max-w-2xl text-sm font-medium text-gray-700 dark:text-gray-300">{shown.competencyLine}</p>
      )}
      {enrollment?.dueAt && (
        <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
          {t('dueAt')}: {new Date(enrollment.dueAt).toLocaleDateString()}
        </p>
      )}
      <PracticeLinks links={shown.practiceLinks} title={t('practice')} />

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
            {courseOutline(
              slug,
              lessons.map((lesson) => localizeLesson(lesson, locale)),
              quizzes.map((quiz) => localizeQuiz(quiz, locale)),
              course.hoursCredit,
            ).map((item) => (
              <li key={item.key} className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                {item.kind === 'quiz' ? (
                  <Link href={item.href} className="block text-sm font-medium text-gray-900 hover:underline dark:text-gray-100">
                    <span className="me-2 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">{t('quiz')}</span>
                    {item.title}
                  </Link>
                ) : (
                  <LessonRow slug={slug} item={item} />
                )}
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

function LessonRow({
  slug,
  item,
}: {
  slug: string;
  item: Extract<OutlineRow, { kind: 'lesson' }>;
}) {
  const t = useTranslations('app.course');
  const timeLabel = item.minutes == null
    ? ''
    : item.estimated
      ? t('aboutMinutes', { count: item.minutes })
      : t('minutes', { count: item.minutes });

  if (!timeLabel && item.quizzes.length === 0) {
    return (
      <Link href={item.href} className="block text-sm font-medium text-gray-900 hover:underline dark:text-gray-100">
        {item.lesson.title}
      </Link>
    );
  }

  return (
    <div>
      <Link href={item.href} className="block text-sm font-medium text-gray-900 hover:underline dark:text-gray-100">
        {item.lesson.title}
      </Link>
      <p className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">
        {timeLabel}
        {timeLabel && item.quizzes.length > 0 ? ' · ' : ''}
        {item.quizzes.map((quiz, index) => (
          <span key={quiz.id}>
            {index > 0 ? ', ' : ''}
            <Link href={`/app/courses/${slug}/quizzes?quiz=${quiz.id}`} className="hover:underline">
              {t('quizNamed', { title: quiz.title })}
            </Link>
          </span>
        ))}
      </p>
    </div>
  );
}
