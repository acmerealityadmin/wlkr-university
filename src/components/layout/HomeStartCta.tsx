'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/store/auth';

export function HomeStartCta() {
  const t = useTranslations('public.home.cta');
  const { user, isInitialized, initialize } = useAuth();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const signedIn = isInitialized && Boolean(user);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{signedIn ? t('titleSignedIn') : t('title')}</CardTitle>
        <CardDescription>{signedIn ? t('subtitleSignedIn') : t('subtitle')}</CardDescription>
      </CardHeader>
      <div className="px-5 pb-5">
        {isInitialized ? (
          <Button asChild>
            <Link href={signedIn ? '/app/dashboard' : '/login'}>
              {signedIn ? t('buttonSignedIn') : t('button')}
            </Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
