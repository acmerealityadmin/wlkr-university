'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { useAuth } from '@/store/auth';
import { enrollmentsApi } from '@/lib/api';
import type { Enrollment } from '@/types/api';

const STATUS_VARIANT: Record<Enrollment['status'], 'active' | 'completed' | 'dropped'> = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
};

const STATUS_LABEL_KEY: Record<Enrollment['status'], 'statusActive' | 'statusCompleted' | 'statusDropped'> = {
  ACTIVE: 'statusActive',
  COMPLETED: 'statusCompleted',
  DROPPED: 'statusDropped',
};

export default function DashboardPage() {
  const t = useTranslations('app.dashboard');
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);

  useEffect(() => {
    enrollmentsApi.list().then((d) => setEnrollments(d.enrollments)).catch(() => setEnrollments([]));
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h1>
      {user && <p className="mt-1 text-gray-500">{t('welcome')}, {user.firstName || user.username}</p>}

      <h2 className="mt-8 text-lg font-medium text-gray-900 dark:text-gray-100">{t('myEnrollments')}</h2>

      {enrollments === null ? (
        <PageSpinner />
      ) : enrollments.length === 0 ? (
        <div className="mt-4">
          <p className="text-gray-500">{t('noEnrollments')}</p>
          <Button asChild className="mt-4">
            <Link href="/courses">{t('browseCourses')}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const course = typeof enrollment.courseId === 'string' ? null : enrollment.courseId;
            if (!course) return null;
            return (
              <Link key={enrollment._id} href={`/app/courses/${course.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-card-hover">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>{course.title}</CardTitle>
                      <Badge variant={STATUS_VARIANT[enrollment.status]}>
                        {t(STATUS_LABEL_KEY[enrollment.status])}
                      </Badge>
                    </div>
                    <CardDescription>
                      {t('progress')}: {enrollment.progressPercent}%
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
