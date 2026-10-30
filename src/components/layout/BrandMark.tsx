import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-brand-500 to-brand-600 shadow-soft',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 text-white" fill="none">
        <path
          d="M6 13.5 16 8l10 5.5v9.2c0 .7-.4 1.4-1 1.7L16 29l-9-4.6c-.6-.3-1-1-1-1.7v-9.2Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M16 8v21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10.5 16.2 16 19l5.5-2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

