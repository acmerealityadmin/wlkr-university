'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { canAccessUniversity } from '@/lib/roles';
import { useRouter, usePathname } from '@/i18n/navigation';
import { PageSpinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { PortalShell } from '@/components/layout/PortalShell';
import { useParams } from 'next/navigation';

// Gated LMS shell — client-side auth gate with spinner, no middleware.ts
// (static export doesn't support middleware anyway). Mirrors wlkr-ed-portal's
// (portal)/layout.tsx pattern, plus a native-only biometric lock screen: a
// restored session with biometrics enabled renders isLocked=true and a
// cached (possibly stale) user until unlockWithBiometrics() clears it.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, isLocked, biometricLabel, initialize, unlockWithBiometrics } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();
  const locale = params.locale;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized || isLocked) return;
    if (!user || !canAccessUniversity(user)) {
      router.replace('/login');
    }
  }, [isInitialized, isLocked, user, router, pathname]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <PageSpinner />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-gray-950">
        <p className="text-sm text-gray-500">Unlock WLKR University with {biometricLabel}</p>
        <Button onClick={() => unlockWithBiometrics()}>Unlock</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <PageSpinner />
      </div>
    );
  }

  return (
    <PortalShell variant="app" locale={locale}>
      {children}
    </PortalShell>
  );
}
