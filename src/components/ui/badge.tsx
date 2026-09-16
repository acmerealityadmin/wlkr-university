import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300',
        active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        completed: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
        dropped: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
