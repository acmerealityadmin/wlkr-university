'use client';

import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
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
  if (!lessonId) return [];
  return quizzes.filter((quiz) => quiz.placement === 'after_lesson' && String(quiz.lessonId || '') === lessonId);
}

function readingMinutes(body: string) {
  const words = body.replace(/[#>*_`[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
  if (words === 0) return 5;
  return Math.max(1, Math.min(240, Math.round(words / 180)));
}

function lessonTiming(lesson: Lesson, lessonCount: number, hoursCredit?: number | null) {
  if (lesson.approxMinutes && lesson.approxMinutes > 0) {
    return { minutes: lesson.approxMinutes, estimated: false };
  }
  const hours = Number(hoursCredit) || 0;
  if (hours > 0 && lessonCount > 0) {
    return { minutes: Math.max(1, Math.round((hours * 60) / lessonCount)), estimated: true };
  }
  return { minutes: readingMinutes(lesson.body || ''), estimated: true };
}

type OutlineRow =
  | { key: string; kind: 'quiz'; title: string; href: string }
  | { key: string; kind: 'lesson'; lesson: Lesson; href: string; quizzes: Quiz[]; minutes: number; estimated: boolean };

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
      <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight text-gray-900 dark:text-gray-100">{shown.title}</h2>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">{shown.description}</p>
      {shown.competencyLine && (
        <p className="mt-3 max-w-3xl text-base font-bold text-gray-700 dark:text-gray-200">{shown.competencyLine}</p>
      )}
      {enrollment?.dueAt && (
        <p className="mt-3 text-base font-bold text-rose-600 dark:text-rose-300">
          {t('dueAt')}: {new Date(enrollment.dueAt).toLocaleDateString()}
        </p>
      )}
      <PracticeLinks links={shown.practiceLinks} title={t('practice')} />

      {!enrollment && !remembered ? (
        <Button onClick={onEnroll} disabled={enrolling} size="lg" className="mt-8">
          {t('enroll')}
        </Button>
      ) : (
        <Badge variant="active" className="mt-8 px-4 py-1.5 text-base">
          {t('enrolled')}
        </Badge>
      )}

      {(enrollment || remembered) && (
        <>
          <h2 className="mt-12 font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{t('lessons')}</h2>
          <ol className="mt-5 space-y-3">
            {courseOutline(
              slug,
              lessons.map((lesson) => localizeLesson(lesson, locale)),
              quizzes.map((quiz) => localizeQuiz(quiz, locale)),
              course.hoursCredit,
            ).map((item, index) => (
              <li
                key={item.key}
                className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white px-5 py-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift dark:border-gray-800 dark:bg-gray-900"
              >
                {item.kind === 'quiz' ? (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                      <ClipboardCheck className="h-5 w-5" />
                    </span>
                    <Link href={item.href} className="min-w-0 flex-1 text-lg font-bold text-gray-900 hover:text-brand-700 dark:text-gray-100">
                      <span className="me-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-extrabold uppercase text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">{t('quiz')}</span>
                      {item.title}
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 font-heading text-lg font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                      {index + 1}
                    </span>
                    <LessonRow slug={slug} item={item} />
                  </>
                )}
              </li>
            ))}
          </ol>
          <Button asChild size="lg" className="mt-8">
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
  const timeLabel = item.estimated
    ? t('aboutMinutes', { count: item.minutes })
    : t('minutes', { count: item.minutes });

  return (
    <div className="min-w-0 flex-1">
      <Link href={item.href} className="block text-lg font-bold text-gray-900 hover:text-brand-700 dark:text-gray-100 dark:hover:text-brand-200">
        {item.lesson.title}
      </Link>
      <p className="mt-0.5 text-sm font-normal text-gray-400 dark:text-gray-500">
        {timeLabel}
        {item.quizzes.map((quiz, index) => (
          <span key={quiz.id}>
            {index === 0 ? ' · ' : ', '}
            <Link href={`/app/courses/${slug}/quizzes?quiz=${quiz.id}`} className="hover:underline">
              {t('quizNamed', { title: quiz.title })}
            </Link>
          </span>
        ))}
      </p>
    </div>
  );
}
