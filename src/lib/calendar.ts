import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { CalendarEvent } from '@/types/api';

export function weekStart(date: Date) {
  return startOfWeek(date, { weekStartsOn: 0 });
}

export function weekEnd(date: Date) {
  return endOfWeek(date, { weekStartsOn: 0 });
}

export function weekDays(date: Date) {
  const start = weekStart(date);
  return eachDayOfInterval({ start, end: addDays(start, 6) });
}

export function monthGrid(date: Date) {
  const start = weekStart(startOfMonth(date));
  const end = weekEnd(endOfMonth(date));
  return eachDayOfInterval({ start, end });
}

export function eventsOnDay(events: CalendarEvent[], day: Date) {
  return events.filter((event) => {
    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    return start <= dayEnd && end >= dayStart;
  });
}

export function formatEventTime(event: CalendarEvent) {
  if (event.allDay) return null;
  return format(new Date(event.startsAt), 'h:mm a');
}

export function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function defaultEventTimes(day: Date) {
  const start = new Date(day);
  if (isToday(day)) {
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
  } else {
    start.setHours(9, 0, 0, 0);
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start, end };
}

export { addDays, addMonths, format, isSameDay, isSameMonth, isToday, startOfMonth, endOfMonth, endOfWeek };
