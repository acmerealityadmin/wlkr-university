'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { useRouter } from '@/i18n/navigation';
import { PageSpinner } from '@/components/ui/spinner';

/** Client-side gate for catalog areas that are members-only. Static export has no middleware. */
export function RequireLogin({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, initialize } = useAuth();
  const router = useRouter();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !user) router.replace('/login');
  }, [isInitialized, user, router]);

  if (!isInitialized || !user) return <PageSpinner />;
  return <>{children}</>;
}
