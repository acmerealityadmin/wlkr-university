'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Video } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { toneFor } from '@/lib/tones';
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
        <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-50 via-white to-amber-50 px-7 py-8 shadow-soft dark:from-brand-900/40 dark:via-gray-900 dark:to-amber-900/20 sm:px-10">
          <div className="pointer-events-none absolute -end-12 -top-12 h-48 w-48 rounded-full bg-sky-100/70 blur-3xl dark:bg-amber-500/10" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-base font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">{t('welcome')}</p>
              <h2 className="mt-1 font-heading text-4xl font-semibold text-gray-900 dark:text-white">
                {user.firstName || user.username} <span aria-hidden>👋</span>
              </h2>
            </div>
            <Button asChild size="lg">
              <Link href="/courses">{t('browseCourses')}</Link>
            </Button>
          </div>
        </section>
      )}

      <DashboardWeekCalendar />

      {webinars.filter((w) => new Date(w.endsAt).getTime() >= Date.now()).length > 0 && (
        <div className="mt-12">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{t('upcomingWebinars')}</h2>
            <Link href="/app/webinars" className="text-base font-bold text-brand-600 hover:underline dark:text-brand-300">
              {t('viewWebinars')}
            </Link>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {webinars
              .filter((w) => new Date(w.endsAt).getTime() >= Date.now())
              .slice(0, 3)
              .map((webinar) => (
                <Link key={webinar.id} href={`/app/webinars/${webinar.slug}`} className="group block h-full">
                  <Card className="h-full">
                    <CardHeader>
                      <div className={cn('mb-2 flex h-12 w-12 items-center justify-center rounded-2xl', toneFor(webinar.slug))}>
                        <Video className="h-6 w-6" />
                      </div>
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

      <h2 className="mt-12 font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{t('myEnrollments')}</h2>

      {enrollments === null ? (
        <PageSpinner />
      ) : enrollments.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-[2rem] border-2 border-dashed border-brand-200 bg-white/70 px-8 py-12 text-center dark:border-brand-500/30 dark:bg-gray-900/60">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <GraduationCap className="h-8 w-8" />
          </div>
          <p className="mt-4 max-w-md text-lg text-gray-600 dark:text-gray-300">{t('noEnrollments')}</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/courses">{t('browseCourses')}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const loaded = typeof enrollment.courseId === 'string' ? null : enrollment.courseId;
            if (!loaded) return null;
            const course = localizeCourse(loaded, locale);
            return (
              <Link key={enrollment._id} href={`/app/courses/${course.slug}`} className="group block h-full">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', toneFor(`/courses/${course.slug}`))}>
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <Badge variant={STATUS_VARIANT[enrollment.status]}>
                        {t(STATUS_LABEL_KEY[enrollment.status])}
                      </Badge>
                    </div>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>
                      {t('progress')}: {enrollment.progressPercent}%
                      {enrollment.required ? ` · ${t('required')}` : ''}
                      {enrollment.dueAt ? ` · ${new Date(enrollment.dueAt).toLocaleDateString()}` : ''}
                    </CardDescription>
                    <div className="pt-3">
                      <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-[width] duration-500"
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
