import { ExternalLink } from 'lucide-react';
import type { PracticeLink } from '@/types/api';

export function PracticeLinks({
  links,
  title,
}: {
  links?: PracticeLink[] | null;
  title?: string;
}) {
  const items = (links || []).filter((row) => row?.label && row?.href);
  if (items.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
      {title && <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>}
      <ul className={title ? 'mt-2 space-y-1.5' : 'space-y-1.5'}>
        {items.map((link) => (
          <li key={`${link.label}:${link.href}`}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              {link.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
