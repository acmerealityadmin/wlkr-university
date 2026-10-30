import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-base font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-brand-600 text-white shadow-button hover:-translate-y-0.5 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400',
        secondary:
          'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-200 dark:hover:bg-brand-500/25',
        outline:
          'border-2 border-gray-200 bg-white text-gray-800 hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-brand-500/60',
        ghost: 'text-gray-600 hover:bg-brand-50 hover:text-brand-700 dark:text-gray-300 dark:hover:bg-gray-800',
        destructive: 'bg-rose-500 text-white shadow-sm hover:bg-rose-600',
        link: 'h-auto p-0 font-bold text-brand-600 underline-offset-4 hover:underline dark:text-brand-300',
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-10 px-4 text-sm',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
