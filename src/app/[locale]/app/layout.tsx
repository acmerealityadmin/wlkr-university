'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { canAccessUniversity } from '@/lib/roles';
import { useRouter, usePathname } from '@/i18n/navigation';
import { PageSpinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/layout/AppHeader';
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageSpinner />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-sm text-gray-500">Unlock WLKR University with {biometricLabel}</p>
        <Button onClick={() => unlockWithBiometrics()}>Unlock</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader locale={locale} />
      <main className="master-column animate-fade-in py-8">{children}</main>
    </div>
  );
}
