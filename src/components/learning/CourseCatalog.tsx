'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, LayoutGrid, List } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VIEW_KEY = 'wlkr-university-courses-view';

export type CourseCatalogItem = {
  slug: string;
  title: string;
  description?: string | null;
  meta?: string;
};

function CourseHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
        <GraduationCap className="h-4 w-4" />
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

  if (courses.length === 0) return <p className="text-sm text-gray-500">{empty}</p>;

  return (
    <div>
      <div className="mb-4 flex justify-end" role="group" aria-label={t('viewLabel')}>
        <div className="inline-flex rounded-xl border border-gray-200 p-1 dark:border-gray-800">
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

      <div className={cn(view === 'cards' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-3')}>
        {courses.map((course) => (
          <Link key={course.slug} href={`/courses/${course.slug}`} className="group block h-full">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader className={view === 'list' ? 'sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:space-y-0' : undefined}>
                <div className="min-w-0 flex-1">
                  <CourseHeading title={course.title} />
                  {course.description && (
                    <CardDescription className={cn('mt-2', view === 'cards' ? 'line-clamp-3' : 'line-clamp-2')}>
                      {course.description}
                    </CardDescription>
                  )}
                </div>
                {course.meta && (
                  <p className={cn('text-xs text-gray-400', view === 'list' ? 'sm:shrink-0 sm:pt-0' : 'pt-1')}>
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
