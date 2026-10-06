'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSpinner } from '@/components/ui/spinner';
import { webinarsApi } from '@/lib/api';
import { hoursLabel } from '@/components/learning/TrackBadge';
import type { Webinar, WebinarAttendance } from '@/types/api';

type Row = Webinar & { attendance: Pick<WebinarAttendance, 'status' | 'minutesWatched'> | null };

export default function AppWebinarsPage() {
  const t = useTranslations('app.webinars');
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    webinarsApi.list().then((d) => setRows(d.webinars)).catch(() => setRows([]));
  }, []);

  if (rows === null) return <PageSpinner />;

  const upcoming = rows.filter((w) => new Date(w.endsAt).getTime() >= Date.now());
  const past = rows.filter((w) => new Date(w.endsAt).getTime() < Date.now());

  const list = (items: Row[], emptyKey: 'emptyUpcoming' | 'emptyPast') =>
    items.length === 0 ? (
      <p className="mt-3 text-sm text-gray-500">{t(emptyKey)}</p>
    ) : (
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {items.map((webinar) => (
          <Link key={webinar.id} href={`/app/webinars/${webinar.slug}`} className="group block h-full">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={webinar.kind === 'office_hours' ? 'draft' : 'default'}>
                    {webinar.kind === 'office_hours' ? t('officeHours') : t('webinar')}
                  </Badge>
                  {hoursLabel(webinar.hoursCredit) && <Badge variant="outline">{hoursLabel(webinar.hoursCredit)}</Badge>}
                  {webinar.attendance?.status && (
                    <Badge variant="active">{t(`status.${webinar.attendance.status}`)}</Badge>
                  )}
                </div>
                <CardTitle>{webinar.title}</CardTitle>
                <CardDescription>
                  {new Date(webinar.startsAt).toLocaleString()}
                  {webinar.hostName ? ` · ${webinar.hostName}` : ''}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    );

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">{t('description')}</p>
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('upcoming')}</h2>
      {list(upcoming, 'emptyUpcoming')}
      <h2 className="mt-10 text-lg font-medium text-gray-900 dark:text-gray-100">{t('past')}</h2>
      {list(past, 'emptyPast')}
    </div>
  );
}
