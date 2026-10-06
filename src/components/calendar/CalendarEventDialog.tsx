'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { calendarApi } from '@/lib/api';
import { defaultEventTimes, toDatetimeLocal } from '@/lib/calendar';
import type { CalendarEvent, CalendarEventKind } from '@/types/api';

const KINDS: CalendarEventKind[] = ['personal', 'session', 'deadline', 'course'];

export function CalendarEventDialog({
  open,
  onOpenChange,
  event,
  initialDay,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  initialDay: Date;
  onSaved: (event: CalendarEvent) => void;
  onDeleted?: (id: string) => void;
}) {
  const t = useTranslations('app.calendar');
  const defaults = defaultEventTimes(initialDay);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CalendarEventKind>('personal');
  const [allDay, setAllDay] = useState(false);
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(defaults.start));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(defaults.end));
  const [saving, setSaving] = useState(false);

  const readOnly = Boolean(event?.readOnly);

  useEffect(() => {
    if (!open) return;
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setKind(event.kind);
      setAllDay(event.allDay);
      setStartsAt(toDatetimeLocal(new Date(event.startsAt)));
      setEndsAt(toDatetimeLocal(new Date(event.endsAt)));
      return;
    }
    const next = defaultEventTimes(initialDay);
    setTitle('');
    setDescription('');
    setKind('personal');
    setAllDay(false);
    setStartsAt(toDatetimeLocal(next.start));
    setEndsAt(toDatetimeLocal(next.end));
  }, [open, event, initialDay]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (readOnly || !title.trim()) return;
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        kind,
        allDay,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      };
      const data = event
        ? await calendarApi.update(event.id, body)
        : await calendarApi.create(body);
      onSaved(data.event);
      onOpenChange(false);
    } catch {
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!event || readOnly) return;
    setSaving(true);
    try {
      await calendarApi.remove(event.id);
      onDeleted?.(event.id);
      onOpenChange(false);
    } catch {
      toast.error(t('deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const kindLabel = useMemo(() => {
    if (!event) return t('kinds.personal');
    return t(`kinds.${event.kind}`);
  }, [event, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {readOnly ? event?.title : event ? t('editEvent') : t('addEvent')}
          </DialogTitle>
          <DialogDescription>{readOnly ? kindLabel : t('formHint')}</DialogDescription>
        </DialogHeader>
        {readOnly && event ? (
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {event.description && <p className="whitespace-pre-line">{event.description}</p>}
            <p className="text-xs text-gray-400">
              {new Date(event.startsAt).toLocaleString()} – {new Date(event.endsAt).toLocaleString()}
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              {event.href && (
                <Button asChild>
                  <Link href={event.href as '/'}>{t('openLinked')}</Link>
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Input label={t('title')} value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input
              label={t('description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="calendar-kind" className="text-sm font-medium text-foreground">
                {t('kind')}
              </label>
              <select
                id="calendar-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as CalendarEventKind)}
                className="h-10 rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {KINDS.map((value) => (
                  <option key={value} value={value}>
                    {t(`kinds.${value}`)}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="accent-brand-600" />
              {t('allDay')}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="calendar-starts-at"
                label={t('startsAt')}
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startsAt.slice(0, 10) : startsAt}
                onChange={(e) => setStartsAt(allDay ? `${e.target.value}T00:00` : e.target.value)}
                required
              />
              <Input
                id="calendar-ends-at"
                label={t('endsAt')}
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endsAt.slice(0, 10) : endsAt}
                onChange={(e) => setEndsAt(allDay ? `${e.target.value}T23:59` : e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              {event && (
                <Button type="button" variant="destructive" onClick={() => void onDelete()} disabled={saving} className="sm:me-auto">
                  {t('delete')}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={saving || !title.trim()}>
                {saving ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
