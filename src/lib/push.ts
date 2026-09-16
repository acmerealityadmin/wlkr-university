import { PushNotifications } from '@capacitor/push-notifications';
import { isNative, platform } from './capacitor';
import { univ } from './api';

// Net new — no WLKR repo has push wired up yet. Thin plugin wrapper
// following the same "plugin → src/lib/ wrapper → store" convention used
// for biometrics/secure-storage. Registers for push on native app start and
// forwards taps on a "certificate earned" notification to /app/certificates.
//
// BACKEND GAP: wlkr-ecko-server has no device-token registration endpoint
// yet. `registerDeviceToken` below POSTs to a `/v1/university/push/register`
// route that does not exist — this call will 404 until that route is added
// (suggested shape: `POST /v1/university/push/register`, guarded by
// requireAuth(), body `{token: string, platform: 'ios'|'android'}`, upserting
// onto a DeviceToken collection keyed by {userId, token}). Failures here are
// caught and swallowed; push simply won't be delivered until the backend
// route ships.

let listenersRegistered = false;

async function registerDeviceToken(token: string) {
  try {
    await univ.post('/push/register', { token, platform: platform() });
  } catch {
    // Expected until the backend route above is built.
  }
}

export type PushTapHandler = (data: Record<string, unknown>) => void;

/** Call once at native app startup (e.g. from the root [locale]/layout.tsx client shell). */
export async function initPushNotifications(onTap: PushTapHandler) {
  if (!isNative()) return;

  const perm = await PushNotifications.checkPermissions();
  let granted = perm.receive === 'granted';
  if (!granted && perm.receive !== 'denied') {
    const req = await PushNotifications.requestPermissions();
    granted = req.receive === 'granted';
  }
  if (!granted) return;

  await PushNotifications.register();

  if (listenersRegistered) return;
  listenersRegistered = true;

  PushNotifications.addListener('registration', (token) => {
    void registerDeviceToken(token.value);
  });

  PushNotifications.addListener('registrationError', () => {
    // Nothing actionable client-side; push just won't be available this session.
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const data = (action.notification.data ?? {}) as Record<string, unknown>;
    onTap(data);
  });
}
