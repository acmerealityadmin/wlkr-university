import { Badge } from '@/components/ui/badge';
import type { CourseTrack } from '@/types/api';

const TRACK_LABEL: Record<Exclude<CourseTrack, ''>, string> = {
  teacher: 'Teachers',
  admin: 'Admins',
  first_30_days: 'First 30 days',
};

export function TrackBadge({ track }: { track?: CourseTrack | string | null }) {
  if (!track || track === '') return null;
  const label = TRACK_LABEL[track as Exclude<CourseTrack, ''>] || track;
  return <Badge variant="outline">{label}</Badge>;
}

export function hoursLabel(hours?: number | null) {
  const n = Number(hours) || 0;
  if (n <= 0) return null;
  return n === 1 ? '1 clock hour' : `${n} clock hours`;
}
