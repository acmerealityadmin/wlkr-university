import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();
export const platform = () => Capacitor.getPlatform();

/** Wire Android hardware back button to browser history; exit the app at the root. Call once at root mount. */
export function registerBackButtonHandler() {
  if (!Capacitor.isNativePlatform()) return () => {};
  const listenerPromise = App.addListener('backButton', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
  return () => {
    listenerPromise.then((l) => l.remove());
  };
}
