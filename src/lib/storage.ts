import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Preferences } from '@capacitor/preferences';

/**
 * Sensitive values (JWTs). Backed by iOS Keychain / Android Keystore
 * (EncryptedSharedPreferences) — unlike @capacitor/preferences, which is
 * plaintext UserDefaults/SharedPreferences and unsuitable for tokens.
 * Ported from wlkr-field-app/src/lib/storage.ts. Only used when isNative()
 * — on web, src/lib/tokens.ts talks to localStorage directly instead.
 */
export const secureStorage = {
  get(key: string): Promise<string | null> {
    return SecureStorage.getItem(key);
  },
  set(key: string, value: string): Promise<void> {
    return SecureStorage.setItem(key, value);
  },
  remove(key: string): Promise<void> {
    return SecureStorage.removeItem(key);
  },
};

/** Non-sensitive preferences (biometric-enabled flag, cached user for offline restore). */
export const prefs = {
  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  },
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  },
};
