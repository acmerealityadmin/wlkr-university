'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  ClipboardList,
  Gamepad2,
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

const NAV_TONES: Record<string, string> = {
  '/': 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  '/app/dashboard': 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300',
  '/app/calendar': 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  '/courses': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  '/webinars': 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  '/app/webinars': 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  '/app/certificates': 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  '/app/training': 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  '/articles': 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  '/explore/webinars': 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  '/explore/wlkr-learning': 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300',
  '/explore/media-library': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  '/explore/analytics': 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  '/media': 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
};

function navTone(href: string) {
  return NAV_TONES[href] ?? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300';
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

    if (!user) {
      return [
        { label: t('navGroups.overview'), items: overview },
        {
          label: t('navGroups.explore'),
          items: [
            { href: '/explore/webinars', label: t('nav.exploreWebinars'), icon: Video },
            { href: '/explore/wlkr-learning', label: t('nav.exploreWlkrLearning'), icon: Gamepad2 },
            { href: '/explore/media-library', label: t('nav.exploreMediaLibrary'), icon: BookOpen },
            { href: '/explore/analytics', label: t('nav.exploreAnalytics'), icon: BarChart3 },
            { href: '/articles', label: t('nav.blog'), icon: Newspaper },
          ],
        },
      ];
    }

    return [
      { label: t('navGroups.overview'), items: overview },
      {
        label: t('navGroups.catalog'),
        items: [
          { href: '/courses', label: t('nav.courses'), icon: GraduationCap },
          { href: '/webinars', label: t('nav.webinars'), icon: Video },
          { href: '/articles', label: t('nav.blog'), icon: Newspaper },
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
          'fixed inset-y-0 start-0 z-40 flex w-72 flex-col bg-white/85 backdrop-blur-xl dark:bg-gray-950/90',
          'border-e border-gray-100 dark:border-gray-800/60',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
          'lg:translate-x-0',
        )}
      >
        <div className="flex h-24 items-center justify-between px-6">
          <Link href={homeHref as '/'} className="flex min-w-0 items-center gap-3 no-underline" onClick={onClose}>
            <BrandMark />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-heading text-2xl font-semibold text-gray-900 dark:text-white">
                {t('brandShort')}
              </span>
              <span className="block text-sm font-bold text-brand-600 dark:text-brand-300">{t('portalSubtitle')}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2">
          {navGroups.map((group) => {
            const isCollapsed = Boolean(collapsed[group.label]);
            const hasActive = groupContainsActive(pathname, group);

            return (
              <div key={group.label} className="mb-4">
                <button
                  type="button"
                  onClick={() => toggleSection(group.label)}
                  aria-expanded={!isCollapsed}
                  className={cn(
                    'mb-1 flex w-full items-center justify-between rounded-xl px-3 py-1.5',
                    'text-xs font-extrabold uppercase tracking-wider',
                    'text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600',
                    'dark:text-gray-500 dark:hover:bg-gray-800/60 dark:hover:text-gray-300',
                    hasActive && isCollapsed && 'text-brand-500 dark:text-brand-400',
                  )}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-200',
                      isCollapsed && '-rotate-90',
                    )}
                  />
                </button>

                <ul
                  className={cn(
                    'space-y-1 overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out',
                    isCollapsed ? 'pointer-events-none max-h-0 opacity-0' : 'max-h-[800px] opacity-100',
                  )}
                >
                  {group.items.map(({ href, label, icon: Icon, exact = false }) => {
                    const active = itemIsActive(pathname, href, exact);
                    const tone = navTone(href);
                    return (
                      <li key={`${group.label}-${href}`}>
                        <Link
                          href={href as '/'}
                          onClick={onClose}
                          className={cn(
                            'group flex items-center gap-3 rounded-2xl px-2.5 py-2 text-base font-bold transition-all duration-150',
                            active
                              ? 'bg-brand-50 text-brand-700 shadow-soft dark:bg-brand-500/15 dark:text-brand-200'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-white',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                              active ? 'bg-brand-600 text-white' : tone,
                            )}
                          >
                            <Icon className="h-5 w-5" strokeWidth={2.25} />
                          </span>
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="p-4">
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-3 py-3 dark:bg-gray-900">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white shadow-sm">
                {getInitials(userLabel(user))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold leading-tight text-gray-800 dark:text-gray-100">
                  {userLabel(user)}
                </p>
                <p className="mt-0.5 truncate text-sm text-gray-400 dark:text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex h-12 items-center justify-center gap-2.5 rounded-full bg-brand-600 text-base font-bold text-white shadow-button transition-transform hover:-translate-y-0.5"
            >
              <LogIn className="h-5 w-5" />
              {t('nav.login')}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
