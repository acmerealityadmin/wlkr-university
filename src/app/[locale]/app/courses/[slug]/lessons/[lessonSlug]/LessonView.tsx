'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PageSpinner } from '@/components/ui/spinner';
import { coursesApi, lessonsApi, quizzesApi } from '@/lib/api';
import { PracticeLinks } from '@/components/learning/PracticeLinks';
import { LessonBody } from '@/components/learning/LessonBody';
import { LessonMediaIcons } from '@/components/learning/LessonMediaIcons';
import { LessonMediaList } from '@/components/learning/LessonMediaList';
import { LessonEndActions } from '@/components/learning/LessonEndActions';
import { LessonEditors } from '@/components/learning/LessonEditors';
import { localizeLesson, localizeQuiz } from '@/lib/localizedContent';
import type { Lesson, Quiz } from '@/types/api';

function lessonIdOf(lesson: Lesson) {
  return String(lesson.id || lesson._id || '');
}

function quizzesOnLesson(lesson: Lesson, lessons: Lesson[], quizzes: Quiz[]) {
  const id = lessonIdOf(lesson);
  const attached = quizzes.filter(
    (quiz) => quiz.placement === 'after_lesson' && String(quiz.lessonId || '') === id,
  );
  const maxOrder = lessons.reduce((max, row) => Math.max(max, row.order ?? 0), 0);
  const isLast = (lesson.order ?? 0) >= maxOrder;
  if (!isLast) return attached;
  const ending = quizzes.filter((quiz) => quiz.placement !== 'start' && quiz.placement !== 'after_lesson');
  return [...attached, ...ending];
}

export function LessonView({ courseSlug, lessonSlug }: { courseSlug: string; lessonSlug: string }) {
  const t = useTranslations('app.course');
  const locale = useLocale();
  const [lesson, setLesson] = useState<Lesson | null | undefined>(undefined);
  const [courseId, setCourseId] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { courses } = await coursesApi.listCatalog();
      const course = courses.find((c) => c.slug === courseSlug);
      if (!course) {
        if (!cancelled) setLesson(null);
        return;
      }
      const [{ lessons }, quizList] = await Promise.all([
        lessonsApi.listForCourse(course._id),
        quizzesApi.listForCourse(course._id).catch(() => ({ quizzes: [] as Quiz[] })),
      ]);
      if (!cancelled) {
        setCourseId(course._id);
        setQuizzes(quizList.quizzes || []);
        setLessons(lessons);
        setLesson(lessons.find((l) => l.slug === lessonSlug) ?? null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [courseSlug, lessonSlug]);

  if (lesson === undefined) return <PageSpinner />;
  if (lesson === null) return <p className="text-muted-foreground">Lesson not found.</p>;

  const id = lessonIdOf(lesson);
  const shown = localizeLesson(lesson, locale);
  const shownQuizzes = quizzes.map((quiz) => localizeQuiz(quiz, locale));

  return (
    <div className="max-w-2xl">
      <Link href={`/app/courses/${courseSlug}`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        ← {t('backToCourse')}
      </Link>
      <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100">{shown.title}</h2>
      {shown.audio?.url ? (
        <audio className="mt-4 w-full" controls preload="none" src={shown.audio.url}>
          {t('listen')}
        </audio>
      ) : null}
      <LessonMediaIcons media={shown.media} />
      <div className="mt-6">
        <LessonBody body={shown.body} />
      </div>
      <LessonMediaList media={shown.media} />
      <PracticeLinks links={shown.practiceLinks} title={t('practice')} />
      <LessonEndActions
        courseId={courseId}
        courseSlug={courseSlug}
        lessonId={id}
        quizzes={quizzesOnLesson(lesson, lessons, shownQuizzes)}
      />
      <LessonEditors editors={lesson.editors} />
    </div>
  );
}
