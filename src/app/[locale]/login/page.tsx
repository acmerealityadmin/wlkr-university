'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { BrandMark } from '@/components/layout/BrandMark';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/store/auth';
import { authApi } from '@/lib/api';
import { universityCleverCallbackUrl } from '@/lib/clever-login';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const locale = useLocale();
  const { login, isLoading, user, isInitialized, initialize } = useAuth();
  const [cleverEnabled, setCleverEnabled] = useState(false);
  const [cleverDistrictId, setCleverDistrictId] = useState('');
  const [cleverLoading, setCleverLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && user) {
      router.replace('/app/dashboard');
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    authApi
      .cleverStatus()
      .then(({ enabled, districtId }) => {
        setCleverEnabled(Boolean(enabled));
        setCleverDistrictId(districtId || '');
      })
      .catch(() => setCleverEnabled(false));
  }, []);

  const portalCallbackUrl = () => universityCleverCallbackUrl(window.location.origin, locale);

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      router.push('/app/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (err instanceof Error ? err.message : t('error'));
      toast.error(msg);
    }
  };

  if (!isInitialized || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <PageSpinner />
      </div>
    );
  }

  const onCleverSso = () => {
    setCleverLoading(true);
    window.location.href = authApi.cleverLoginUrl(portalCallbackUrl(), cleverDistrictId || undefined);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-gray-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 text-gray-900 dark:text-white">
          <BrandMark />
          <span className="font-heading text-xl font-medium tracking-tight">WLKR University</span>
        </Link>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>

          {cleverEnabled && (
            <button
              type="button"
              onClick={onCleverSso}
              disabled={cleverLoading}
              className="mt-6 isolate flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: '#1464FF' }}
              aria-label={t('clever')}
            >
              {cleverLoading ? (
                t('cleverRedirecting')
              ) : (
                <Image
                  src="/images/brand/clever-logotype-white.png"
                  alt=""
                  width={1024}
                  height={273}
                  className="h-7 w-auto mix-blend-screen"
                />
              )}
            </button>
          )}

          {cleverEnabled && (
            <p className="mt-5 text-center text-xs font-medium uppercase tracking-wide text-gray-400">
              {t('orEmail')}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={cleverEnabled ? 'mt-4 space-y-4' : 'mt-6 space-y-4'} noValidate>
            <Input
              label={t('email')}
              type="email"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={t('password')}
              type="password"
              autoComplete="current-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? t('submitting') : t('submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
