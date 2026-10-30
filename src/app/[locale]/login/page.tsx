'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock } from 'lucide-react';
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
  email: z.string().trim().min(1, 'Enter a username or email'),
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
      <div className="app-backdrop flex min-h-screen items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  const onCleverSso = () => {
    setCleverLoading(true);
    window.location.href = authApi.cleverLoginUrl(portalCallbackUrl(), cleverDistrictId || undefined);
  };

  return (
    <div className="app-backdrop relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute end-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3 text-gray-900 dark:text-white">
          <BrandMark className="h-14 w-14 rounded-3xl" />
          <span className="font-heading text-3xl font-semibold">WLKR University</span>
        </Link>
        <div className="rounded-[2rem] border border-white bg-white/90 p-8 shadow-lift backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 sm:p-10">
          <h1 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{t('subtitle')}</p>

          {cleverEnabled && (
            <button
              type="button"
              onClick={onCleverSso}
              disabled={cleverLoading}
              className="mt-8 isolate flex h-14 w-full items-center justify-center gap-2.5 rounded-full text-lg font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
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
            <p className="mt-6 text-center text-sm font-extrabold uppercase tracking-wider text-gray-400">
              {t('orEmail')}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={cleverEnabled ? 'mt-5 space-y-5' : 'mt-8 space-y-5'} noValidate>
            <Input
              label={t('email')}
              type="text"
              placeholder={t('identifierPlaceholder')}
              autoComplete="username"
              leftIcon={<User className="h-5 w-5" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={t('password')}
              type="password"
              autoComplete="current-password"
              leftIcon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" size="lg" disabled={isLoading} className="mt-2 w-full">
              {isLoading ? t('submitting') : t('submit')}
            </Button>
          </form>
          <p className="mt-6 text-center text-base text-gray-500 dark:text-gray-400">
            {t('noAccount')}{' '}
            <Link href="/signup" className="font-bold text-brand-600 hover:underline dark:text-brand-300">
              {t('createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
