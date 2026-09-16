'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { isNative, registerBackButtonHandler } from '@/lib/capacitor';
import { initPushNotifications } from '@/lib/push';

/**
 * Native-only startup wiring: Android hardware back button + push
 * notification registration/tap-routing. No-op on web (isNative() short-
 * circuits everything below). Mounted once in the root [locale]/layout.tsx.
 */
export function NativeBootstrap() {
  const router = useRouter();

  useEffect(() => {
    if (!isNative()) return;
    const unregisterBackButton = registerBackButtonHandler();
    void initPushNotifications((data) => {
      if (data.type === 'certificate_earned') {
        router.push('/app/certificates');
      }
    });
    return unregisterBackButton;
  }, [router]);

  return null;
}
