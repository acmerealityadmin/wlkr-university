'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, LayoutGrid, List } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toneFor } from '@/lib/tones';

const VIEW_KEY = 'wlkr-university-courses-view';

export type CourseCatalogItem = {
  slug: string;
  title: string;
  description?: string | null;
  meta?: string;
};

function CourseHeading({ title, slug }: { title: string; slug: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', toneFor(`/courses/${slug}`))}>
        <GraduationCap className="h-6 w-6" />
      </div>
      <CardTitle>{title}</CardTitle>
    </div>
  );
}

export function CourseCatalog({
  courses,
  empty,
}: {
  courses: CourseCatalogItem[];
  empty: string;
}) {
  const t = useTranslations('public.courses');
  const [view, setView] = useState<'cards' | 'list'>('cards');

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_KEY);
    if (saved === 'list' || saved === 'cards') setView(saved);
  }, []);

  const choose = (next: 'cards' | 'list') => {
    setView(next);
    window.localStorage.setItem(VIEW_KEY, next);
  };

  if (courses.length === 0) return <p className="text-lg text-gray-500">{empty}</p>;

  return (
    <div>
      <div className="mb-6 flex justify-end" role="group" aria-label={t('viewLabel')}>
        <div className="inline-flex gap-1 rounded-full border-2 border-gray-100 bg-white p-1 shadow-soft dark:border-gray-800 dark:bg-gray-900">
          <Button
            type="button"
            size="sm"
            variant={view === 'cards' ? 'default' : 'ghost'}
            aria-pressed={view === 'cards'}
            onClick={() => choose('cards')}
          >
            <LayoutGrid className="h-4 w-4" />
            {t('viewCards')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === 'list' ? 'default' : 'ghost'}
            aria-pressed={view === 'list'}
            onClick={() => choose('list')}
          >
            <List className="h-4 w-4" />
            {t('viewList')}
          </Button>
        </div>
      </div>

      <div className={cn(view === 'cards' ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4')}>
        {courses.map((course) => (
          <Link key={course.slug} href={`/courses/${course.slug}`} className="group block h-full">
            <Card className="h-full">
              <CardHeader className={view === 'list' ? 'sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:space-y-0' : undefined}>
                <div className="min-w-0 flex-1">
                  <CourseHeading title={course.title} slug={course.slug} />
                  {course.description && (
                    <CardDescription className={cn('mt-3', view === 'cards' ? 'line-clamp-3' : 'line-clamp-2')}>
                      {course.description}
                    </CardDescription>
                  )}
                </div>
                {course.meta && (
                  <p
                    className={cn(
                      'inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-300',
                      view === 'list' ? 'sm:shrink-0' : 'mt-2',
                    )}
                  >
                    {course.meta}
                  </p>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
