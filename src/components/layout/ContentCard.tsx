import { GraduationCap, Newspaper } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ContentCard({
  href,
  title,
  description,
  meta,
  kind = 'course',
}: {
  href: string;
  title: string;
  description?: string | null;
  meta?: string;
  kind?: 'course' | 'article';
}) {
  const Icon = kind === 'article' ? Newspaper : GraduationCap;

  return (
    <Link href={href as '/'} className="group block h-full">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            <Icon className="h-4 w-4" />
          </div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="line-clamp-3">{description}</CardDescription>}
          {meta && <p className="pt-1 text-xs text-gray-400">{meta}</p>}
        </CardHeader>
      </Card>
    </Link>
  );
}

export function PageIntro({
  description,
  className,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}) {
  if (!description) return null;
  return <p className={cn('mb-6 max-w-2xl text-sm text-gray-500 dark:text-gray-400', className)}>{description}</p>;
}
