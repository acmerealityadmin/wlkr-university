'use client';

import { useCallback, useEffect, useState } from 'react';
import { calendarApi } from '@/lib/api';
import type { CalendarEvent } from '@/types/api';

export function useCalendarEvents(from: Date, to: Date) {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);

  const load = useCallback(() => {
    calendarApi
      .list(fromIso, toIso)
      .then((d) => setEvents(d.events))
      .catch(() => setEvents([]));
  }, [fromIso, toIso]);

  useEffect(() => {
    setEvents(null);
    load();
  }, [load]);

  const upsert = (event: CalendarEvent) => {
    setEvents((prev) => {
      const list = prev ?? [];
      const index = list.findIndex((item) => item.id === event.id);
      const next = index === -1 ? [...list, event] : list.map((item, i) => (i === index ? event : item));
      return next.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    });
  };

  const remove = (id: string) => {
    setEvents((prev) => (prev ?? []).filter((item) => item.id !== id));
  };

  return { events, loading: events === null, upsert, remove, reload: load };
}
