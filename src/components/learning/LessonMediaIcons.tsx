import { FileText, Image as ImageIcon, Music, Video } from 'lucide-react';
import type { LessonMedia } from '@/types/api';

function MediaIcon({ type }: { type: LessonMedia['type'] }) {
  if (type === 'IMAGE') return <ImageIcon className="h-5 w-5" />;
  if (type === 'VIDEO') return <Video className="h-5 w-5" />;
  if (type === 'AUDIO') return <Music className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

export function LessonMediaIcons({ media }: { media?: LessonMedia[] | null }) {
  const items = media || [];
  if (items.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#lesson-media-${item.id}`}
          title={item.title}
          aria-label={item.title}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-brand-700 shadow-sm hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-900 dark:text-brand-300 dark:hover:border-brand-500"
        >
          <MediaIcon type={item.type} />
        </a>
      ))}
    </div>
  );
}
