'use client';

import { useState } from 'react';
import type { CalendarEvent } from '@/types/api';

export function useEventDialog() {
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [initialDay, setInitialDay] = useState(() => new Date());

  const openCreate = (day: Date) => {
    setEvent(null);
    setInitialDay(day);
    setOpen(true);
  };

  const openEdit = (next: CalendarEvent) => {
    setEvent(next);
    setInitialDay(new Date(next.startsAt));
    setOpen(true);
  };

  return { open, setOpen, event, initialDay, openCreate, openEdit };
}
