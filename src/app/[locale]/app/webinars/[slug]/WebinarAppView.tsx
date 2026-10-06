'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { CalendarPlus, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSpinner } from '@/components/ui/spinner';
import { webinarsApi } from '@/lib/api';
import { hoursLabel } from '@/components/learning/TrackBadge';
import type { Webinar, WebinarAttendance } from '@/types/api';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function WebinarAppView({ slug }: { slug: string }) {
  const t = useTranslations('app.webinars');
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [attendance, setAttendance] = useState<WebinarAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    webinarsApi
      .get(slug)
      .then((d) => {
        if (cancelled) return;
        setWebinar(d.webinar);
        setAttendance(d.attendance);
      })
      .catch(() => {
        if (!cancelled) setWebinar(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <PageSpinner />;
  if (!webinar) return <p className="text-muted-foreground">{t('notFound')}</p>;

  const now = Date.now();
  const starts = new Date(webinar.startsAt).getTime();
  const ends = new Date(webinar.endsAt).getTime();
  const live = now >= starts - 15 * 60 * 1000 && now <= ends;
  const past = now > ends;
  const hours = hoursLabel(webinar.hoursCredit);

  const onRsvp = async () => {
    setBusy(true);
    try {
      const d = await webinarsApi.rsvp(slug);
      setWebinar(d.webinar);
      setAttendance(d.attendance);
      toast.success(t('rsvpSaved'));
    } catch {
      toast.error(t('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const onAttend = async () => {
    setBusy(true);
    try {
      const d = await webinarsApi.attend(slug);
      setWebinar(d.webinar);
      setAttendance(d.attendance);
      toast.success(t('attendedSaved'));
    } catch {
      toast.error(t('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const onIcs = async () => {
    try {
      const blob = await webinarsApi.downloadIcs(slug);
      downloadBlob(blob, `${webinar.slug}.ics`);
    } catch {
      toast.error(t('actionError'));
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/app/webinars" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        ← {t('back')}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant={webinar.kind === 'office_hours' ? 'draft' : 'default'}>
          {webinar.kind === 'office_hours' ? t('officeHours') : t('webinar')}
        </Badge>
        {hours && <Badge variant="outline">{hours}</Badge>}
        {attendance?.status && <Badge variant="active">{t(`status.${attendance.status}`)}</Badge>}
      </div>
      <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100">
        {webinar.title}
      </h2>
      {webinar.hostName && (
        <p className="mt-1 text-sm text-gray-500">{t('hostedBy', { name: webinar.hostName })}</p>
      )}
      <p className="mt-2 text-sm text-gray-500">
        {new Date(webinar.startsAt).toLocaleString()} – {new Date(webinar.endsAt).toLocaleTimeString()}
      </p>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {webinar.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {!past && webinar.joinUrl && (
          <Button asChild>
            <a href={webinar.joinUrl} target="_blank" rel="noreferrer">
              {live ? t('joinNow') : t('join')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
        {!past && attendance?.status !== 'RSVP' && attendance?.status !== 'ATTENDED' && (
          <Button variant="outline" disabled={busy} onClick={() => void onRsvp()}>
            {t('rsvp')}
          </Button>
        )}
        {(live || past) && attendance?.status !== 'ATTENDED' && (
          <Button variant="outline" disabled={busy} onClick={() => void onAttend()}>
            {t('markAttended')}
          </Button>
        )}
        <Button variant="outline" onClick={() => void onIcs()}>
          <CalendarPlus className="h-4 w-4" />
          {t('addToCalendar')}
        </Button>
      </div>

      {past && webinar.recordingUrl && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('recording')}</h3>
          <a
            href={webinar.recordingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            {t('watchRecording')}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
      {webinar.slidesUrl && (
        <a
          href={webinar.slidesUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          {t('slides')}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      {webinar.relatedArticleSlug && (
        <p className="mt-6 text-sm">
          <Link href={`/articles/${webinar.relatedArticleSlug}`} className="font-medium text-brand-700 hover:underline dark:text-brand-300">
            {t('relatedArticle')}
          </Link>
        </p>
      )}
    </div>
  );
}
