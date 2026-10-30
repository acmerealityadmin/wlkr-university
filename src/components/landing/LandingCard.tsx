import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export type LandingLink = { label: string; href: string; external?: boolean };

export function LandingCard({
  icon: Icon,
  tone,
  eyebrow,
  title,
  description,
  links,
}: {
  icon: LucideIcon;
  tone: string;
  eyebrow?: string;
  title: string;
  description: string;
  links: LandingLink[];
}) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-soft lg:p-5 xl:p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift dark:border-gray-800 dark:bg-gray-900">
      <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', tone)}>
        <Icon className="h-6 w-6" />
      </span>
      {eyebrow && <p className="mt-5 text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">{eyebrow}</p>}
      <h3 className={cn('font-heading text-xl font-semibold leading-snug text-gray-900 dark:text-gray-100', eyebrow ? 'mt-1' : 'mt-5')}>
        {title}
      </h3>
      <p className="mt-2 line-clamp-6 text-base leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
      <ul className="mt-auto space-y-2 pt-5">
        {links.map((link) => {
          const className =
            'group text-base font-bold leading-snug text-brand-600 hover:text-brand-500 dark:text-brand-300';
          const body = (
            <>
              {link.label}
              <ArrowRight className="ms-1.5 inline h-4 w-4 align-[-2px] transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
            </>
          );
          return (
            <li key={link.href + link.label}>
              {link.external ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                  {body}
                </a>
              ) : (
                <Link href={link.href} className={className}>
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
