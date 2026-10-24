'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { useAuth } from '@/store/auth';
import { enrollmentsApi, webinarsApi } from '@/lib/api';
import { DashboardWeekCalendar } from '@/components/calendar/DashboardWeekCalendar';
import { hoursLabel } from '@/components/learning/TrackBadge';
import { localizeCourse } from '@/lib/localizedContent';
import type { Enrollment, Webinar } from '@/types/api';

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
  const locale = useLocale();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [webinars, setWebinars] = useState<Webinar[]>([]);

  useEffect(() => {
    enrollmentsApi.list().then((d) => setEnrollments(d.enrollments)).catch(() => setEnrollments([]));
    webinarsApi.list().then((d) => setWebinars(d.webinars)).catch(() => setWebinars([]));
  }, []);

  return (
    <div>
      {user && (
        <p className="text-sm text-gray-500">
          {t('welcome')}, {user.firstName || user.username}
        </p>
      )}

      <DashboardWeekCalendar />

      {webinars.filter((w) => new Date(w.endsAt).getTime() >= Date.now()).length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('upcomingWebinars')}</h2>
            <Link href="/app/webinars" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              {t('viewWebinars')}
            </Link>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {webinars
              .filter((w) => new Date(w.endsAt).getTime() >= Date.now())
              .slice(0, 3)
              .map((webinar) => (
                <Link key={webinar.id} href={`/app/webinars/${webinar.slug}`} className="group block h-full">
                  <Card className="h-full transition-shadow group-hover:shadow-md">
                    <CardHeader>
                      <CardTitle>{webinar.title}</CardTitle>
                      <CardDescription>
                        {new Date(webinar.startsAt).toLocaleString()}
                        {hoursLabel(webinar.hoursCredit) ? ` · ${hoursLabel(webinar.hoursCredit)}` : ''}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      )}

      <h2 className="mt-8 text-lg font-medium text-gray-900 dark:text-gray-100">{t('myEnrollments')}</h2>

      {enrollments === null ? (
        <PageSpinner />
      ) : enrollments.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/50 p-8">
          <p className="text-muted-foreground">{t('noEnrollments')}</p>
          <Button asChild className="mt-4">
            <Link href="/courses">{t('browseCourses')}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const loaded = typeof enrollment.courseId === 'string' ? null : enrollment.courseId;
            if (!loaded) return null;
            const course = localizeCourse(loaded, locale);
            return (
              <Link key={enrollment._id} href={`/app/courses/${course.slug}`} className="group block h-full">
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle>{course.title}</CardTitle>
                      <Badge variant={STATUS_VARIANT[enrollment.status]}>
                        {t(STATUS_LABEL_KEY[enrollment.status])}
                      </Badge>
                    </div>
                    <CardDescription>
                      {t('progress')}: {enrollment.progressPercent}%
                      {enrollment.required ? ` · ${t('required')}` : ''}
                      {enrollment.dueAt ? ` · ${new Date(enrollment.dueAt).toLocaleDateString()}` : ''}
                    </CardDescription>
                    <div className="pt-2">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${Math.min(100, Math.max(0, enrollment.progressPercent))}%` }}
                        />
                      </div>
                    </div>
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
