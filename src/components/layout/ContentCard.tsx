import { ArrowRight, GraduationCap, Newspaper } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toneFor } from '@/lib/tones';

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
  const t = useTranslations('common.cardAction');
  const Icon = kind === 'article' ? Newspaper : GraduationCap;

  return (
    <Link href={href as '/'} className="group block h-full">
      <Card className="flex h-full flex-col">
        <CardHeader className="flex-1">
          <div className={cn('mb-2 flex h-12 w-12 items-center justify-center rounded-2xl', toneFor(href))}>
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="line-clamp-3">{description}</CardDescription>}
          {meta && <p className="pt-1 text-sm font-semibold text-gray-400">{meta}</p>}
        </CardHeader>
        <div className="flex items-center gap-1.5 px-6 pb-6 text-base font-bold text-brand-600 dark:text-brand-300">
          <span>{kind === 'article' ? t('read') : t('open')}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
        </div>
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
  return <p className={cn('mb-8 max-w-2xl text-lg leading-relaxed text-gray-500 dark:text-gray-400', className)}>{description}</p>;
}
