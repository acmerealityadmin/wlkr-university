'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { useEventDialog } from '@/components/calendar/useEventDialog';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { addMonths, endOfMonth, format, startOfMonth, weekEnd, weekStart } from '@/lib/calendar';
import { PageSpinner } from '@/components/ui/spinner';

export default function CalendarPage() {
  const t = useTranslations('app.calendar');
  const [cursor, setCursor] = useState(() => new Date());
  const range = useMemo(() => {
    const month = startOfMonth(cursor);
    return { month, from: weekStart(month), to: weekEnd(endOfMonth(month)) };
  }, [cursor]);
  const { events, loading, upsert, remove } = useCalendarEvents(range.from, range.to);
  const dialog = useEventDialog();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor((d) => addMonths(startOfMonth(d), -1))} aria-label={t('prevMonth')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[10rem] text-center font-heading text-lg font-medium text-gray-900 dark:text-gray-100">
            {format(range.month, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCursor((d) => addMonths(startOfMonth(d), 1))} aria-label={t('nextMonth')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>
            {t('today')}
          </Button>
        </div>
        <Button onClick={() => dialog.openCreate(new Date())}>
          <Plus className="h-4 w-4" />
          {t('addEvent')}
        </Button>
      </div>

      {loading ? (
        <PageSpinner />
      ) : (
        <MonthCalendar
          month={range.month}
          events={events ?? []}
          onSelectDay={dialog.openCreate}
          onSelectEvent={dialog.openEdit}
        />
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-medium text-gray-500">
        {(['personal', 'session', 'deadline', 'course', 'webinar', 'office_hours'] as const).map((kind) => (
          <span key={kind} className="inline-flex items-center gap-1.5">
            <span
              className={
                kind === 'personal'
                  ? 'h-2 w-2 rounded-full bg-brand-500'
                  : kind === 'session'
                    ? 'h-2 w-2 rounded-full bg-sky-500'
                    : kind === 'deadline'
                      ? 'h-2 w-2 rounded-full bg-rose-500'
                      : kind === 'course'
                        ? 'h-2 w-2 rounded-full bg-emerald-500'
                        : kind === 'webinar'
                          ? 'h-2 w-2 rounded-full bg-violet-500'
                          : 'h-2 w-2 rounded-full bg-amber-500'
              }
            />
            {t(`kinds.${kind}`)}
          </span>
        ))}
      </div>

      <CalendarEventDialog
        open={dialog.open}
        onOpenChange={dialog.setOpen}
        event={dialog.event}
        initialDay={dialog.initialDay}
        onSaved={upsert}
        onDeleted={remove}
      />
    </div>
  );
}
