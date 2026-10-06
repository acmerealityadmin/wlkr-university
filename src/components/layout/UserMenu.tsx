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
        className="ml-1 flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[10px] font-bold text-white">
            {getInitials(label)}
          </div>
        )}
        <span className="hidden max-w-[120px] truncate text-xs font-medium text-gray-700 sm:block dark:text-gray-300">
          {label}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-[calc(100%+8px)] z-50 w-56 rounded-xl border border-gray-100 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{label}</p>
            <p className="truncate text-xs text-gray-400">{user.email}</p>
          </div>
          <Link
            href="/app/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 no-underline transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/80 dark:hover:text-white"
          >
            <UserRound className="h-4 w-4 text-gray-400" />
            {t('nav.profile')}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void onLogout()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
