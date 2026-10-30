import type { CalendarEvent } from '@/types/api';

export const CALENDAR_KIND_CLASS: Record<CalendarEvent['kind'], string> = {
  personal: 'bg-brand-50 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200',
  session: 'bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200',
  deadline: 'bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
  course: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  webinar: 'bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200',
  office_hours: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
};
