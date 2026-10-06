'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogIn,
  Newspaper,
  Settings,
  Video,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn, getInitials } from '@/lib/utils';
import { BrandMark } from '@/components/layout/BrandMark';
import { useAuth } from '@/store/auth';
import { canAssignTraining } from '@/lib/roles';
import type { User } from '@/types/api';

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const COLLAPSE_STORAGE_KEY = 'wlkr-university.sidebar.collapsedSections';

function userLabel(user: User) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.username || user.email;
}

function itemIsActive(pathname: string, href: string, exact?: boolean) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (href === '/courses') {
    return path === '/courses' || path.startsWith('/courses/') || path.startsWith('/app/courses');
  }
  if (href === '/webinars' || href === '/app/webinars') {
    return path === '/webinars' || path.startsWith('/webinars/') || path.startsWith('/app/webinars');
  }
  if (exact) return path === href;
  return path === href || path.startsWith(`${href}/`);
}

function groupContainsActive(pathname: string, group: NavGroup) {
  return group.items.some((item) => itemIsActive(pathname, item.href, item.exact));
}

function readCollapsedSections(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function Sidebar({
  variant,
  open,
  onClose,
}: {
  variant: 'public' | 'app';
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const { user } = useAuth();
  const assign = canAssignTraining(user);

  const navGroups = useMemo((): NavGroup[] => {
    if (variant === 'app') {
      const learn: NavItem[] = [
        { href: '/courses', label: t('nav.courses'), icon: GraduationCap },
        { href: '/app/webinars', label: t('nav.webinars'), icon: Video },
        { href: '/app/certificates', label: t('nav.certificates'), icon: Award },
      ];
      if (assign) {
        learn.push({ href: '/app/training', label: t('nav.training'), icon: ClipboardList });
      }
      return [
        {
          label: t('navGroups.overview'),
          items: [
            { href: '/app/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, exact: true },
            { href: '/app/calendar', label: t('nav.calendar'), icon: Calendar },
          ],
        },
        { label: t('navGroups.learn'), items: learn },
        {
          label: t('navGroups.account'),
          items: [{ href: '/app/settings', label: t('nav.settings'), icon: Settings }],
        },
      ];
    }

    const overview: NavItem[] = [{ href: '/', label: t('nav.home'), icon: Home, exact: true }];
    if (user) {
      overview.push({ href: '/app/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, exact: true });
      overview.push({ href: '/app/calendar', label: t('nav.calendar'), icon: Calendar });
    }

    return [
      { label: t('navGroups.overview'), items: overview },
      {
        label: t('navGroups.catalog'),
        items: [
          { href: '/courses', label: t('nav.courses'), icon: GraduationCap },
          { href: '/webinars', label: t('nav.webinars'), icon: Video },
          { href: '/articles', label: t('nav.articles'), icon: Newspaper },
          { href: '/media', label: t('nav.media'), icon: BookOpen },
        ],
      },
    ];
  }, [t, user, variant, assign]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(readCollapsedSections());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const activeGroup = navGroups.find((g) => groupContainsActive(pathname, g));
    if (!activeGroup) return;
    setCollapsed((prev) => {
      if (!prev[activeGroup.label]) return prev;
      const next = { ...prev, [activeGroup.label]: false };
      localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [pathname, hydrated, navGroups]);

  const toggleSection = (label: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const homeHref = variant === 'app' ? '/app/dashboard' : '/';

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-64 flex-col bg-white dark:bg-gray-950',
          'border-e border-gray-100 dark:border-gray-800/60',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
          'lg:translate-x-0',
        )}
      >
        <div className="flex h-[5.5rem] items-center justify-between px-5">
          <Link href={homeHref as '/'} className="flex min-w-0 items-center gap-2.5 no-underline" onClick={onClose}>
            <BrandMark />
            <span className="min-w-0">
              <span className="block truncate font-heading text-base font-medium tracking-tight text-gray-900 dark:text-white">
                {t('brandShort')}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{t('portalSubtitle')}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group) => {
            const isCollapsed = Boolean(collapsed[group.label]);
            const hasActive = groupContainsActive(pathname, group);

            return (
              <div key={group.label} className="mb-2">
                <button
                  type="button"
                  onClick={() => toggleSection(group.label)}
                  aria-expanded={!isCollapsed}
                  className={cn(
                    'mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-1.5',
                    'text-[10px] font-semibold uppercase tracking-widest',
                    'text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600',
                    'dark:text-gray-500 dark:hover:bg-gray-800/60 dark:hover:text-gray-300',
                    hasActive && isCollapsed && 'text-brand-500 dark:text-brand-400',
                  )}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                      isCollapsed && '-rotate-90',
                    )}
                  />
                </button>

                <ul
                  className={cn(
                    'space-y-0.5 overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out',
                    isCollapsed ? 'pointer-events-none max-h-0 opacity-0' : 'max-h-[800px] opacity-100',
                  )}
                >
                  {group.items.map(({ href, label, icon: Icon, exact = false }) => {
                    const active = itemIsActive(pathname, href, exact);
                    return (
                      <li key={`${group.label}-${href}`}>
                        <Link
                          href={href as '/'}
                          onClick={onClose}
                          className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                            active
                              ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200',
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition-colors',
                              active
                                ? 'text-brand-600 dark:text-brand-400'
                                : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300',
                            )}
                            strokeWidth={active ? 2.5 : 2}
                          />
                          {label}
                          {active && (
                            <span className="ms-auto h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-3 dark:border-gray-800/60">
          {user ? (
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[10px] font-bold text-white shadow-sm">
                {getInitials(userLabel(user))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-none text-gray-800 dark:text-gray-200">
                  {userLabel(user)}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60"
            >
              <LogIn className="h-4 w-4" />
              {t('nav.login')}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
