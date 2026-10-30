import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200',
        active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        completed: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
        dropped: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
        draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        outline: 'border-2 border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300',
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
