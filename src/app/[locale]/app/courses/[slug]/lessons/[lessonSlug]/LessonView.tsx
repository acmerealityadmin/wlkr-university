'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PageSpinner } from '@/components/ui/spinner';
import { coursesApi, lessonsApi } from '@/lib/api';
import { PracticeLinks } from '@/components/learning/PracticeLinks';
import { LessonBody } from '@/components/learning/LessonBody';
import type { Lesson } from '@/types/api';

export function LessonView({ courseSlug, lessonSlug }: { courseSlug: string; lessonSlug: string }) {
  const t = useTranslations('app.course');
  const [lesson, setLesson] = useState<Lesson | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { courses } = await coursesApi.list({ limit: 100 });
      const course = courses.find((c) => c.slug === courseSlug);
      if (!course) {
        if (!cancelled) setLesson(null);
        return;
      }
      const { lessons } = await lessonsApi.listForCourse(course._id);
      if (!cancelled) setLesson(lessons.find((l) => l.slug === lessonSlug) ?? null);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [courseSlug, lessonSlug]);

  if (lesson === undefined) return <PageSpinner />;
  if (lesson === null) return <p className="text-muted-foreground">Lesson not found.</p>;

  return (
    <div className="max-w-2xl">
      <Link href={`/app/courses/${courseSlug}`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        ← {t('backToCourse')}
      </Link>
      <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100">{lesson.title}</h2>
      <div className="mt-6">
        <LessonBody body={lesson.body} />
      </div>
      <PracticeLinks links={lesson.practiceLinks} title={t('practice')} />
    </div>
  );
}
