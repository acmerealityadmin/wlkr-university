import { cn } from '@/lib/utils';

const GOLD = '#c9a24b';
const GOLD_LIGHT = '#e9d49a';
const NAVY = '#1e3a8a';
const NAVY_DEEP = '#142354';

function Star({ x, y }: { x: number; y: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(0.55)`}
      d="M0 -9 L2.6 -2.8 L9.2 -2.8 L3.9 1.2 L5.9 7.6 L0 3.8 L-5.9 7.6 L-3.9 1.2 L-9.2 -2.8 L-2.6 -2.8 Z"
      fill={NAVY_DEEP}
    />
  );
}

/** Heraldic shield: gold chief with three stars over an open book on navy. */
export function CrestShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={cn('h-16 w-auto drop-shadow-md', className)} aria-hidden>
      <defs>
        <clipPath id="crest-inner">
          <path d="M60 12 L102 22 V62 C102 91 83 112 60 125 C37 112 18 91 18 62 V22 Z" />
        </clipPath>
      </defs>
      <path d="M60 4 L110 16 V62 C110 96 88 120 60 134 C32 120 10 96 10 62 V16 Z" fill={GOLD} />
      <path d="M60 8 L106 19 V62 C106 93.5 85.5 116 60 129.5 C34.5 116 14 93.5 14 62 V19 Z" fill={NAVY_DEEP} />
      <g clipPath="url(#crest-inner)">
        <rect x="0" y="0" width="120" height="140" fill={NAVY} />
        <rect x="0" y="0" width="120" height="44" fill={GOLD_LIGHT} />
        <rect x="0" y="44" width="120" height="2.5" fill={GOLD} />
        <Star x={40} y={33} />
        <Star x={60} y={30} />
        <Star x={80} y={33} />
        <path d="M60 70 C50 63 38 63 29 66 V98 C38 95 50 95 60 102 Z" fill="#fff" />
        <path d="M60 70 C70 63 82 63 91 66 V98 C82 95 70 95 60 102 Z" fill="#f1f5f9" />
        <path d="M60 70 V102" stroke={GOLD} strokeWidth="1.6" />
        <path d="M35 74 H53 M35 80 H53 M35 86 H51 M67 74 H85 M67 80 H85 M67 86 H83" stroke="#94a3b8" strokeWidth="1.2" />
        <path d="M27 100 C40 97 50 98 60 104 C70 98 80 97 93 100" stroke={GOLD} strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
}

/** Ivy-style lockup: crest, WLKR in Trajan-like capitals, UNIVERSITY tracked out, motto rule. */
export function UniversityCrest({
  size = 'lg',
  tone = 'light',
  showMotto = true,
  className,
}: {
  size?: 'sm' | 'lg';
  tone?: 'light' | 'dark';
  showMotto?: boolean;
  className?: string;
}) {
  const light = tone === 'light';
  if (size === 'sm') {
    return (
      <span className={cn('inline-flex items-center gap-3', className)}>
        <CrestShield className="h-11" />
        <span className="flex flex-col leading-none">
          <span className={cn('font-display text-xl font-bold tracking-[0.12em]', light ? 'text-white' : 'text-brand-900 dark:text-white')}>
            WLKR
          </span>
          <span className={cn('mt-1 font-display text-[0.65rem] font-semibold tracking-[0.42em]', light ? 'text-[#e9d49a]' : 'text-[#a8812f] dark:text-[#e9d49a]')}>
            UNIVERSITY
          </span>
        </span>
      </span>
    );
  }

  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <CrestShield className="h-24 sm:h-28" />
      <h1 className="mt-4 font-display text-5xl font-bold tracking-[0.14em] text-white drop-shadow-lg sm:text-7xl" style={{ marginInlineEnd: '-0.14em' }}>
        WLKR
      </h1>
      <div className="mt-3 flex items-center gap-4">
        <span className="h-px w-10 bg-[#e9d49a]/70 sm:w-16" />
        <span className="font-display text-lg font-semibold tracking-[0.5em] text-[#e9d49a] sm:text-2xl" style={{ marginInlineEnd: '-0.5em' }}>UNIVERSITY</span>
        <span className="h-px w-10 bg-[#e9d49a]/70 sm:w-16" />
      </div>
      {showMotto && (
        <p className="mt-4 font-display text-xs font-semibold tracking-[0.35em] text-white/75 sm:text-sm" style={{ marginInlineEnd: '-0.35em' }}>
          DISCE · COGITA · CREA
        </p>
      )}
    </div>
  );
}
