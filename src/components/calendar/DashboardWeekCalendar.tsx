'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';
import { WeekCalendar } from '@/components/calendar/WeekCalendar';
import { useEventDialog } from '@/components/calendar/useEventDialog';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { format, weekEnd, weekStart } from '@/lib/calendar';

export function DashboardWeekCalendar() {
  const t = useTranslations('app.dashboard');
  const range = useMemo(() => {
    const now = new Date();
    return { from: weekStart(now), to: weekEnd(now) };
  }, []);
  const { events, loading, upsert, remove } = useCalendarEvents(range.from, range.to);
  const dialog = useEventDialog();
  const weekLabel = `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d')}`;

  return (
    <Card className="mt-6">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>{t('thisWeek')}</CardTitle>
          <p className="mt-1 text-sm text-gray-500">{weekLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => dialog.openCreate(new Date())}>
            <Plus className="h-4 w-4" />
            {t('addEvent')}
          </Button>
          <Button asChild size="sm">
            <Link href="/app/calendar">{t('viewCalendar')}</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <WeekCalendar
            weekOf={range.from}
            events={events ?? []}
            compact
            onSelectDay={dialog.openCreate}
            onSelectEvent={dialog.openEdit}
          />
        )}
      </CardContent>
      <CalendarEventDialog
        open={dialog.open}
        onOpenChange={dialog.setOpen}
        event={dialog.event}
        initialDay={dialog.initialDay}
        onSaved={upsert}
        onDeleted={remove}
      />
    </Card>
  );
}
