import {
  AndroidBiometryStrength,
  BiometricAuth,
  BiometryError,
  BiometryErrorType,
  BiometryType,
} from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';
import { prefs } from './storage';

// Ported from wlkr-field-app/src/lib/biometrics.ts. Gates a *restored*
// session behind Face ID / Touch ID / fingerprint on native only — it does
// not itself store any secret, it just decides whether to show the already-
// hydrated session (see src/store/auth.ts's initialize()).

const BIOMETRIC_PREF = 'wlkr.university.biometricEnabled';

let biometricPromptOpen = false;

export function isBiometricPromptOpen() {
  return biometricPromptOpen;
}

export async function checkBiometryAvailable(): Promise<{
  available: boolean;
  biometryType: BiometryType;
  label: string;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { available: false, biometryType: BiometryType.none, label: 'Biometrics' };
  }
  try {
    const info = await BiometricAuth.checkBiometry();
    return {
      available: info.isAvailable,
      biometryType: info.biometryType,
      // On Android, biometryType is unreliable for what apps can actually use.
      label: Capacitor.getPlatform() === 'android' ? 'Biometrics' : biometryLabel(info.biometryType),
    };
  } catch {
    return { available: false, biometryType: BiometryType.none, label: 'Biometrics' };
  }
}

export function biometryLabel(type: BiometryType): string {
  switch (type) {
    case BiometryType.faceId:
      return 'Face ID';
    case BiometryType.touchId:
      return 'Touch ID';
    case BiometryType.faceAuthentication:
      return 'Face unlock';
    case BiometryType.fingerprintAuthentication:
      return 'Fingerprint';
    case BiometryType.irisAuthentication:
      return 'Iris';
    default:
      return 'Biometrics';
  }
}

export async function authenticateWithBiometrics(reason = 'Unlock WLKR University'): Promise<boolean> {
  biometricPromptOpen = true;
  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: 'Cancel',
      allowDeviceCredential: true,
      iosFallbackTitle: 'Use passcode',
      androidTitle: 'Unlock WLKR University',
      androidSubtitle: reason,
      androidConfirmationRequired: false,
      androidBiometryStrength: AndroidBiometryStrength.weak,
    });
    return true;
  } catch (error) {
    if (error instanceof BiometryError && error.code === BiometryErrorType.userCancel) {
      return false;
    }
    return false;
  } finally {
    biometricPromptOpen = false;
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  const value = await prefs.get(BIOMETRIC_PREF);
  return value === 'true';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await prefs.set(BIOMETRIC_PREF, 'true');
  } else {
    await prefs.remove(BIOMETRIC_PREF);
  }
}
