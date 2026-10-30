const TONES = [
  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300',
  'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
];

/** Stable color chip for a content item, keyed by its URL or slug. */
export function toneFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}
