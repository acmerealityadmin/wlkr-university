import { isNative } from './capacitor';
import { secureStorage } from './storage';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

// Native secure-storage reads are async native-bridge calls, but the axios
// interceptor in src/lib/api.ts needs to read a token synchronously on every
// request. So on native we mirror both tokens in memory, hydrated once at
// startup (see hydrateTokensFromStorage, called from the auth store's
// initialize()) — same pattern as wlkr-field-app/src/lib/api.ts. On web we
// just read/write localStorage directly; no hydration needed.
let nativeAccessToken: string | null = null;
let nativeRefreshToken: string | null = null;

export async function hydrateTokensFromStorage(): Promise<void> {
  if (!isNative()) return;
  try {
    [nativeAccessToken, nativeRefreshToken] = await Promise.all([
      secureStorage.get(ACCESS_KEY),
      secureStorage.get(REFRESH_KEY),
    ]);
  } catch {
    // Keychain/Keystore bridge hiccup — leave tokens null, user re-logs in.
  }
}

export function getAccessToken(): string | null {
  if (isNative()) return nativeAccessToken;
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (isNative()) return nativeRefreshToken;
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  if (isNative()) {
    nativeAccessToken = accessToken;
    nativeRefreshToken = refreshToken;
    await Promise.all([secureStorage.set(ACCESS_KEY, accessToken), secureStorage.set(REFRESH_KEY, refreshToken)]);
    return;
  }
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  if (isNative()) {
    nativeAccessToken = null;
    nativeRefreshToken = null;
    await Promise.all([secureStorage.remove(ACCESS_KEY), secureStorage.remove(REFRESH_KEY)]);
    return;
  }
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
