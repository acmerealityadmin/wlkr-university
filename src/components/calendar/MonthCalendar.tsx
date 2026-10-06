'use client';

import { cn } from '@/lib/utils';
import { eventsOnDay, format, formatEventTime, isSameMonth, isToday, monthGrid } from '@/lib/calendar';
import { CALENDAR_KIND_CLASS } from '@/components/calendar/eventStyles';
import type { CalendarEvent } from '@/types/api';

export function MonthCalendar({
  month,
  events,
  onSelectDay,
  onSelectEvent,
}: {
  month: Date;
  events: CalendarEvent[];
  onSelectDay?: (day: Date) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}) {
  const days = monthGrid(month);

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-px">
        {days.slice(0, 7).map((day) => (
          <div key={day.toISOString()} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {format(day, 'EEE')}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const dayEvents = eventsOnDay(events, day);
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[110px] bg-white p-2 dark:bg-gray-900',
                !inMonth && 'bg-gray-50 dark:bg-gray-950',
                today && inMonth && 'bg-brand-50/50 dark:bg-brand-500/5',
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDay?.(day)}
                className={cn(
                  'mb-1 text-sm font-medium',
                  inMonth ? 'text-gray-700 dark:text-gray-200' : 'text-gray-300 dark:text-gray-600',
                  today && 'flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white',
                )}
              >
                {format(day, 'd')}
              </button>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const time = formatEventTime(event);
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onSelectEvent?.(event)}
                      className={cn(
                        'block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium',
                        CALENDAR_KIND_CLASS[event.kind] || CALENDAR_KIND_CLASS.session,
                      )}
                    >
                      {time ? `${time} ${event.title}` : event.title}
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
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
