'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { eventsOnDay, format, formatEventTime, isToday, weekDays } from '@/lib/calendar';
import { CALENDAR_KIND_CLASS } from '@/components/calendar/eventStyles';
import type { CalendarEvent } from '@/types/api';

export function WeekCalendar({
  weekOf,
  events,
  onSelectDay,
  onSelectEvent,
  compact = false,
}: {
  weekOf: Date;
  events: CalendarEvent[];
  onSelectDay?: (day: Date) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  compact?: boolean;
}) {
  const t = useTranslations('app.calendar');
  const days = weekDays(weekOf);

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-7 gap-px rounded-2xl border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
        {days.map((day) => {
          const dayEvents = eventsOnDay(events, day);
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[140px] bg-white p-2 dark:bg-gray-900',
                compact && 'min-h-[120px]',
                today && 'bg-brand-50/40 dark:bg-brand-500/5',
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDay?.(day)}
                className="flex w-full items-baseline justify-between rounded-md px-0.5 text-left"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {format(day, 'EEE')}
                </span>
                <span
                  className={cn(
                    'text-sm font-medium text-gray-700 dark:text-gray-200',
                    today && 'flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </button>
              <div className="mt-2 space-y-1">
                {dayEvents.length === 0 ? (
                  <p className="px-0.5 text-[11px] text-gray-300 dark:text-gray-600">{t('noEventsDay')}</p>
                ) : (
                  dayEvents.slice(0, compact ? 3 : 6).map((event) => {
                    const time = formatEventTime(event);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onSelectEvent?.(event)}
                        className={cn(
                          'block w-full truncate rounded-md px-1.5 py-1 text-left text-[11px] font-medium leading-tight',
                          CALENDAR_KIND_CLASS[event.kind] || CALENDAR_KIND_CLASS.session,
                        )}
                      >
                        {time ? `${time} · ${event.title}` : event.title}
                      </button>
                    );
                  })
                )}
                {compact && dayEvents.length > 3 && (
                  <p className="px-0.5 text-[11px] text-gray-400">+{dayEvents.length - 3}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
