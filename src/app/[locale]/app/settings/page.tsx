'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Fingerprint } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemePicker } from '@/components/ui/theme-toggle';
import { useAuth } from '@/store/auth';
import { isNative } from '@/lib/capacitor';

// Native-only biometric settings plus appearance for every surface.
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
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{t('appearanceTitle')}</CardTitle>
          <CardDescription>{t('appearanceDescription')}</CardDescription>
        </CardHeader>
        <div className="px-5 pb-5">
          <ThemePicker />
        </div>
      </Card>

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
