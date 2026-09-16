'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Fingerprint } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth';
import { isNative } from '@/lib/capacitor';

// Native-only settings. On web this page just doesn't render the
// biometrics card (there's nothing else to configure yet).
export default function SettingsPage() {
  const t = useTranslations('app.settings');
  const { biometricEnabled, biometricLabel, enableBiometrics, disableBiometrics, refreshBiometricAvailability } =
    useAuth();
  const [available, setAvailable] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNative());
    refreshBiometricAvailability().then(({ available }) => setAvailable(available));
  }, [refreshBiometricAvailability]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h1>

      {native && available && (
        <Card className="mt-6 max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              {t('biometricTitle', { label: biometricLabel })}
            </CardTitle>
            <CardDescription>{t('biometricDescription', { label: biometricLabel })}</CardDescription>
          </CardHeader>
          <div className="px-5 pb-5">
            {biometricEnabled ? (
              <Button variant="outline" size="sm" onClick={() => disableBiometrics()}>
                {t('disable')}
              </Button>
            ) : (
              <Button size="sm" onClick={() => enableBiometrics()}>
                {t('enable', { label: biometricLabel })}
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
