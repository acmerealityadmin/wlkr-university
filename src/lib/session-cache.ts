import { prefs } from './storage';
import type { User } from '@/types/api';

const CACHED_USER_KEY = 'wlkr.university.cachedUser';

/**
 * Non-sensitive user snapshot for offline/biometric-unlock restore on
 * native — lets unlockWithBiometrics() show something before the network
 * round-trip to /v1/auth/me completes (or if it fails). Mirrors
 * wlkr-field-app/src/lib/session-cache.ts. No-op cost on web.
 */
export async function cacheUser(user: User): Promise<void> {
  try {
    await prefs.set(CACHED_USER_KEY, JSON.stringify(user));
  } catch {
    // best-effort
  }
}

export async function readCachedUser(): Promise<User | null> {
  try {
    const raw = await prefs.get(CACHED_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function clearCachedUser(): Promise<void> {
  try {
    await prefs.remove(CACHED_USER_KEY);
  } catch {
    // best-effort
  }
}
