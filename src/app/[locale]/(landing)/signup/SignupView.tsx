'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Lock, Mail, Sparkles, User } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/store/auth';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

type PlanId = 'educator' | 'pro' | 'classroom';
type CardId = PlanId | 'district';

const DEMO_URL = 'https://wlkrlearning.com/schools#contact';
type Billing = 'monthly' | 'annual';

const PLANS: { id: CardId; monthly: number; annual: number; features: number; featured?: boolean; enterprise?: boolean }[] = [
  { id: 'educator', monthly: 0, annual: 0, features: 4 },
  { id: 'pro', monthly: 4.99, annual: 49.9, features: 5, featured: true },
  { id: 'classroom', monthly: 9.99, annual: 99.9, features: 5 },
  { id: 'district', monthly: 0, annual: 0, features: 6, enterprise: true },
];

const schema = z
  .object({
    email: z.string().trim().email('Enter a valid email address'),
    username: z
      .string()
      .trim()
      .min(3, 'At least 3 characters')
      .max(40, 'At most 40 characters')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Letters, numbers, dots, dashes, and underscores only'),
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
    agree: z.literal(true, { errorMap: () => ({ message: 'Please confirm to continue' }) }),
  })
  .refine((data) => data.password === data.confirm, { message: 'Passwords do not match', path: ['confirm'] });
type FormData = z.infer<typeof schema>;

export function SignupView() {
  const t = useTranslations('public.signup');
  const locale = useLocale();
  const router = useRouter();
  const { login, user, isInitialized, initialize } = useAuth();
  const [billing, setBilling] = useState<Billing>('monthly');
  const [plan, setPlan] = useState<PlanId>('pro');
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const choose = (id: PlanId) => {
    setPlan(id);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await authApi.register({ email: data.email, username: data.username, password: data.password, locale });
      await login(data.username, data.password);
      toast.success(plan === 'educator' ? t('form.successFree') : t('form.successPaid', { plan: t(`plans.${plan}.name`) }));
      router.push('/app/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (err instanceof Error ? err.message : t('form.error'));
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const price = (p: (typeof PLANS)[number]) => {
    const amount = billing === 'monthly' ? p.monthly : p.annual;
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  };

  return (
    <>
      <section className="relative isolate overflow-hidden min-h-[760px] lg:min-h-[840px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-[center_bottom]"
          style={{ backgroundImage: "url('/images/signup-hero.jpg')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-950/80 via-brand-950/45 via-50% to-transparent"
          aria-hidden
        />
        <LandingHeader />
        <div className="mx-auto max-w-3xl px-5 pt-36 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-[#e9d49a] backdrop-blur">
            <Sparkles className="h-4 w-4" />
            {t('hero.eyebrow')}
          </span>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight text-white drop-shadow sm:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow">{t('hero.subtitle')}</p>
          <div className="mt-8 inline-flex rounded-full bg-white/15 p-1.5 backdrop-blur" role="radiogroup" aria-label={t('billing.label')}>
            {(['monthly', 'annual'] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={billing === option}
                onClick={() => setBilling(option)}
                className={cn(
                  'h-11 rounded-full px-6 text-base font-bold transition-colors',
                  billing === option ? 'bg-white text-brand-900 shadow-soft' : 'text-white hover:bg-white/10',
                )}
              >
                {t(`billing.${option}`)}
                {option === 'annual' && (
                  <span className="ms-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{t('billing.save')}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="app-backdrop">
        <div className="mx-auto -mt-20 max-w-7xl px-5 pb-16 lg:px-10">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => {
              const selected = plan === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    'relative flex flex-col rounded-[2rem] border-2 p-7 shadow-lift transition-all',
                    p.enterprise
                      ? 'border-[#c9a24b]/60 bg-gradient-to-b from-brand-700 to-brand-950 text-white'
                      : 'bg-white dark:bg-gray-900',
                    !p.enterprise && (selected ? 'border-brand-500' : 'border-transparent'),
                    p.featured && 'xl:-translate-y-3',
                  )}
                >
                  {p.featured && (
                    <span className="absolute -top-4 start-1/2 -translate-x-1/2 rounded-full bg-[#c9a24b] px-4 py-1 text-sm font-bold text-brand-950 shadow-soft rtl:translate-x-1/2">
                      {t('popular')}
                    </span>
                  )}
                  {p.enterprise && (
                    <span className="absolute -top-4 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1 text-sm font-bold text-brand-900 shadow-soft rtl:translate-x-1/2">
                      {t('enterprise')}
                    </span>
                  )}
                  <h2
                    className={cn(
                      'font-heading text-2xl font-semibold xl:min-h-[4rem]',
                      p.enterprise ? 'text-white' : 'text-gray-900 dark:text-gray-100',
                    )}
                  >
                    {t(`plans.${p.id}.name`)}
                  </h2>
                  <p className={cn('mt-2 text-base xl:min-h-[4.75rem]', p.enterprise ? 'text-white/75' : 'text-gray-500 dark:text-gray-400')}>
                    {t(`plans.${p.id}.tagline`)}
                  </p>
                  {p.enterprise ? (
                    <p className="mt-6 flex items-baseline gap-1.5">
                      <span className="font-heading text-4xl font-semibold text-white">{t('custom')}</span>
                      <span className="text-base font-semibold text-white/70">{t('customNote')}</span>
                    </p>
                  ) : (
                    <p className="mt-6 flex items-baseline gap-1.5">
                      <span className="font-heading text-5xl font-semibold text-gray-900 dark:text-white">${price(p)}</span>
                      <span className="text-base font-semibold text-gray-500">
                        {p.monthly === 0 ? t('forever') : billing === 'monthly' ? t('perMonth') : t('perYear')}
                      </span>
                    </p>
                  )}
                  {p.enterprise ? (
                    <a
                      href={DEMO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex h-14 w-full items-center justify-center whitespace-nowrap rounded-full bg-[#c9a24b] px-4 text-lg font-bold text-brand-950 shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-[#d6b25f]"
                    >
                      {t(`plans.${p.id}.cta`)}
                    </a>
                  ) : (
                    <Button
                      type="button"
                      size="lg"
                      variant={p.featured ? 'default' : 'outline'}
                      className="mt-6 w-full whitespace-nowrap px-4"
                      onClick={() => choose(p.id as PlanId)}
                    >
                      {t(`plans.${p.id}.cta`)}
                    </Button>
                  )}
                  <ul className="mt-8 space-y-3">
                    {Array.from({ length: p.features }, (_, i) => (
                      <li key={i} className={cn('flex gap-3 text-base', p.enterprise ? 'text-white/90' : 'text-gray-700 dark:text-gray-300')}>
                        <span
                          className={cn(
                            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                            p.enterprise
                              ? 'bg-white/15 text-[#e9d49a]'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </span>
                        {t(`plans.${p.id}.features.${i}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div ref={formRef} className="mx-auto mt-16 max-w-xl scroll-mt-8">
            <div className="rounded-[2rem] border border-white bg-white/95 p-8 shadow-lift dark:border-gray-800 dark:bg-gray-900/95 sm:p-10">
              <p className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                {t('form.selected', { plan: t(`plans.${plan}.name`) })}
              </p>
              <h2 className="mt-1 font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{t('form.title')}</h2>
              {plan !== 'educator' && (
                <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-base text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                  {t('form.billingNote')}
                </p>
              )}
              {isInitialized && user ? (
                <div className="mt-6 space-y-4">
                  <p className="text-lg text-gray-600 dark:text-gray-300">{t('form.signedIn')}</p>
                  <Button asChild size="lg" className="w-full">
                    <Link href="/app/dashboard">{t('form.toDashboard')}</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
                  <Input
                    label={t('form.email')}
                    type="email"
                    autoComplete="email"
                    leftIcon={<Mail className="h-5 w-5" />}
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Input
                    label={t('form.username')}
                    autoComplete="username"
                    leftIcon={<User className="h-5 w-5" />}
                    error={errors.username?.message}
                    {...register('username')}
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label={t('form.password')}
                      type="password"
                      autoComplete="new-password"
                      leftIcon={<Lock className="h-5 w-5" />}
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <Input
                      label={t('form.confirm')}
                      type="password"
                      autoComplete="new-password"
                      leftIcon={<Lock className="h-5 w-5" />}
                      error={errors.confirm?.message}
                      {...register('confirm')}
                    />
                  </div>
                  <label className="flex items-start gap-3 text-base text-gray-600 dark:text-gray-300">
                    <input type="checkbox" className="mt-1 h-5 w-5 rounded border-gray-300 accent-brand-600" {...register('agree')} />
                    <span>
                      {t('form.agree')}{' '}
                      <a href="https://wlkrlearning.com/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-600 hover:underline">
                        {t('form.terms')}
                      </a>{' '}
                      {t('form.and')}{' '}
                      <a href="https://wlkrlearning.com/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-600 hover:underline">
                        {t('form.privacy')}
                      </a>
                      .
                    </span>
                  </label>
                  {errors.agree && <p className="text-sm font-bold text-rose-600">{errors.agree.message}</p>}
                  <Button type="submit" size="lg" disabled={submitting} className="w-full">
                    {submitting ? t('form.submitting') : t('form.submit')}
                  </Button>
                  <p className="text-center text-base text-gray-500">
                    {t('form.haveAccount')}{' '}
                    <Link href="/login" className="font-bold text-brand-600 hover:underline">
                      {t('form.login')}
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
