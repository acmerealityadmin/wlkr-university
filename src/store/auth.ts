'use client';

import { create } from 'zustand';
import type { User } from '@/types/api';
import { authApi } from '@/lib/api';
import { canAccessUniversity } from '@/lib/roles';
import { isNative } from '@/lib/capacitor';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, hydrateTokensFromStorage } from '@/lib/tokens';
import {
  authenticateWithBiometrics,
  checkBiometryAvailable,
  isBiometricEnabled,
  setBiometricEnabled as persistBiometricEnabled,
} from '@/lib/biometrics';
import { cacheUser, clearCachedUser, readCachedUser } from '@/lib/session-cache';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  /** Native only: session restored from storage but hidden behind a biometric prompt. */
  isLocked: boolean;
  biometricEnabled: boolean;
  biometricLabel: string;
  login: (email: string, password: string) => Promise<void>;
  completeSamlLogin: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User) => void;
  unlockWithBiometrics: () => Promise<boolean>;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
  refreshBiometricAvailability: () => Promise<{ available: boolean; label: string }>;
}

function withUserId(user: User): User {
  const id = String(user._id || user.id || '');
  return { ...user, _id: id, id: user.id || id };
}

let initializePromise: Promise<void> | null = null;

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  isLocked: false,
  biometricEnabled: false,
  biometricLabel: 'Face ID',

  setUser: (user) => {
    const withId = withUserId(user);
    set({ user: withId });
    void cacheUser(withId);
  },

  initialize: async () => {
    if (get().isInitialized) return;
    if (initializePromise) return initializePromise;

    initializePromise = (async () => {
      const [{ available, label }, biometricOn] = await Promise.all([
        checkBiometryAvailable(),
        isBiometricEnabled(),
      ]);
      set({ biometricLabel: label, biometricEnabled: biometricOn && available });

      // Native: hydrate the in-memory token mirror from Keychain/Keystore
      // before anything reads getAccessToken() synchronously. No-op on web.
      await hydrateTokensFromStorage();

      const token = getAccessToken();
      if (!token) {
        set({ isInitialized: true, isLocked: false });
        return;
      }

      // Gate the restored session behind biometrics when enabled on device.
      if (biometricOn && available && isNative()) {
        const cached = await readCachedUser();
        set({ isLocked: true, user: cached && canAccessUniversity(cached) ? cached : null, isInitialized: true });
        return;
      }

      try {
        const { user } = await authApi.me();
        if (!canAccessUniversity(user)) {
          await clearTokens();
          await clearCachedUser();
          set({ user: null, isInitialized: true });
          return;
        }
        const withId = withUserId(user);
        void cacheUser(withId);
        set({ user: withId, isInitialized: true });
      } catch {
        // Network hiccup on native — fall back to the last cached session
        // rather than forcing a re-login; web has no cache, so it logs out.
        const cached = isNative() ? await readCachedUser() : null;
        if (cached && canAccessUniversity(cached)) {
          set({ user: cached, isInitialized: true });
          return;
        }
        await clearTokens();
        await clearCachedUser();
        set({ user: null, isInitialized: true });
      }
    })();

    return initializePromise;
  },

  unlockWithBiometrics: async () => {
    const ok = await authenticateWithBiometrics(`Unlock with ${get().biometricLabel}`);
    if (!ok) return false;
    set({ isLocked: false });

    if (!get().user) {
      try {
        const { user } = await authApi.me();
        if (canAccessUniversity(user)) {
          const withId = withUserId(user);
          void cacheUser(withId);
          set({ user: withId });
        }
      } catch {
        const cached = await readCachedUser();
        if (cached && canAccessUniversity(cached)) set({ user: cached });
      }
    }
    return true;
  },

  refreshBiometricAvailability: async () => {
    const { available, label } = await checkBiometryAvailable();
    set({ biometricLabel: label });
    return { available, label };
  },

  enableBiometrics: async () => {
    const { available, label } = await checkBiometryAvailable();
    if (!available) {
      set({ biometricLabel: label });
      return false;
    }
    const ok = await authenticateWithBiometrics(`Enable ${label} for WLKR University`);
    if (!ok) return false;
    await persistBiometricEnabled(true);
    set({ biometricEnabled: true, biometricLabel: label });
    return true;
  },

  disableBiometrics: async () => {
    await persistBiometricEnabled(false);
    set({ biometricEnabled: false });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login(email, password);
      if (!canAccessUniversity(data.user)) {
        throw new Error('This portal requires an educator account.');
      }
      await setTokens(data.accessToken, data.refreshToken);
      const withId = withUserId(data.user);
      void cacheUser(withId);
      set({ user: withId });
    } finally {
      set({ isLoading: false });
    }
  },

  completeSamlLogin: async (code) => {
    set({ isLoading: true });
    try {
      const data = await authApi.samlExchange(code);
      if (!canAccessUniversity(data.user)) {
        throw new Error('This portal requires an educator account.');
      }
      await setTokens(data.accessToken, data.refreshToken);
      const withId = withUserId(data.user);
      void cacheUser(withId);
      set({ user: withId });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        /* ignore */
      }
    }
    await clearTokens();
    await clearCachedUser();
    set({ user: null, isLocked: false });
  },
}));
