'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthAwareCta } from '@/components/layout/AuthAwareCta';
import { enrollmentsApi } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { Enrollment } from '@/types/api';

const STORAGE_KEY = 'wlkr-university.enrolled-slugs';

export function readEnrolledSlugs() {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as unknown;
    return new Set(Array.isArray(raw) ? raw.filter((slug) => typeof slug === 'string') : []);
  } catch {
    return new Set<string>();
  }
}

export function rememberEnrolledSlug(slug: string) {
  const slugs = readEnrolledSlugs();
  slugs.add(slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs]));
}

export function forgetEnrolledSlug(slug: string) {
  const slugs = readEnrolledSlugs();
  slugs.delete(slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs]));
}

export function enrollmentForSlug(enrollments: Enrollment[], slug: string, courseId?: string) {
  return enrollments.find((enrollment) => {
    if (enrollment.status === 'DROPPED') return false;
    const course = enrollment.courseId;
    if (typeof course === 'string') return courseId != null && course === courseId;
    return course?.slug === slug || (courseId != null && String(course?._id) === String(courseId));
  }) ?? null;
}

export function CourseEntryCta({ slug }: { slug: string }) {
  const t = useTranslations('public.courses');
  const { user, isInitialized, initialize } = useAuth();
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized || !user) return;
    let cancelled = false;
    if (readEnrolledSlugs().has(slug)) setEnrolled(true);
    enrollmentsApi
      .list()
      .then(({ enrollments }) => {
        if (cancelled) return;
        const existing = enrollmentForSlug(enrollments, slug);
        if (existing) {
          rememberEnrolledSlug(slug);
          setEnrolled(true);
        } else if (!readEnrolledSlugs().has(slug)) {
          setEnrolled(false);
        }
      })
      .catch(() => {
        if (!cancelled) setEnrolled(readEnrolledSlugs().has(slug));
      });
    return () => {
      cancelled = true;
    };
  }, [isInitialized, slug, user]);

  return (
    <AuthAwareCta
      className="mt-6"
      guestLabel={t('enrollCta')}
      signedInHref={`/app/courses/${slug}`}
      signedInLabel={enrolled ? t('continueCta') : t('enrollCtaSignedIn')}
    />
  );
}
