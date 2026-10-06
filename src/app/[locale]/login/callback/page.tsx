'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { BrandMark } from '@/components/layout/BrandMark';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/store/auth';

function CallbackContent() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeSamlLogin, isInitialized, initialize, user } = useAuth();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized) return;
    if (user) {
      router.replace('/app/dashboard');
      return;
    }

    const error = searchParams.get('error');
    if (error) {
      setFailed(true);
      toast.error(decodeURIComponent(error));
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      setFailed(true);
      toast.error(t('callbackMissing'));
      return;
    }

    completeSamlLogin(code)
      .then(() => router.replace('/app/dashboard'))
      .catch((err: unknown) => {
        setFailed(true);
        const msg = err instanceof Error ? err.message : t('callbackFailed');
        toast.error(msg);
      });
  }, [completeSamlLogin, isInitialized, router, searchParams, t, user]);

  if (failed) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-500">{t('callbackFailed')}</p>
        <Button asChild className="mt-6">
          <Link href="/login">{t('backToSignIn')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <PageSpinner />
      <p className="text-sm text-gray-500">{t('callbackWorking')}</p>
    </div>
  );
}

export default function LoginCallbackPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-gray-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 text-gray-900 dark:text-white">
          <BrandMark />
          <span className="font-heading text-xl font-medium tracking-tight">WLKR University</span>
        </Link>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Suspense fallback={<PageSpinner />}>
            <CallbackContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
