'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import type { User } from '@/types/api';

function userLabel(user: User) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.username || user.email;
}

export function UserMenu() {
  const t = useTranslations('common');
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const label = userLabel(user);

  const onLogout = async () => {
    setOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('accountMenu')}
        onClick={() => setOpen((value) => !value)}
        className="ml-1 flex items-center gap-2 rounded-full border-2 border-gray-100 bg-white py-1 pe-3 ps-1 shadow-soft transition-colors hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/40"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
            {getInitials(label)}
          </div>
        )}
        <span className="hidden max-w-[140px] truncate text-sm font-bold text-gray-700 sm:block dark:text-gray-200">
          {label}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-[calc(100%+10px)] z-50 w-64 rounded-3xl border border-gray-100 bg-white p-2 shadow-lift dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="mb-1 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
            <p className="truncate text-base font-bold text-gray-900 dark:text-white">{label}</p>
            <p className="truncate text-sm text-gray-400">{user.email}</p>
          </div>
          <Link
            href="/app/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold text-gray-700 no-underline transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-gray-200 dark:hover:bg-gray-800/80 dark:hover:text-white"
          >
            <UserRound className="h-5 w-5 text-brand-400" />
            {t('nav.profile')}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void onLogout()}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-bold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <LogOut className="h-5 w-5" />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
