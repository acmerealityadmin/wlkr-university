import type { LessonMedia } from '@/types/api';

export function LessonMediaList({ media }: { media?: LessonMedia[] | null }) {
  const items = media || [];
  if (items.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      {items.map((item) => (
        <figure key={item.id} id={`lesson-media-${item.id}`} className="scroll-mt-24 space-y-2">
          <figcaption className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.title}</figcaption>
          {item.type === 'IMAGE' && item.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={item.title} className="max-h-96 rounded-xl" />
          )}
          {item.type === 'VIDEO' && item.url && (
            <video src={item.url} controls className="w-full rounded-xl" />
          )}
          {item.type !== 'IMAGE' && item.type !== 'VIDEO' && item.url && (
            <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
              {item.originalFilename || item.title}
            </a>
          )}
        </figure>
      ))}
    </div>
  );
}
