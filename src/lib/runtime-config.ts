export type RuntimeConfig = {
  apiUrl: string;
};

declare global {
  interface Window {
    __WLKR_CONFIG__?: RuntimeConfig;
  }
}

const DEFAULT_API_URL = 'http://localhost:8080';
const PROD_API_URL = 'https://api.acmereality.net';

function defaultApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return process.env.NODE_ENV === 'production' ? PROD_API_URL : DEFAULT_API_URL;
}

/** Static export has no server runtime to inject config at request time, so
 * this is purely build-time env (NEXT_PUBLIC_API_URL) unlike wlkr-ed-portal's
 * standalone-server variant, which can also read API_URL at request time. */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.__WLKR_CONFIG__?.apiUrl) {
    return window.__WLKR_CONFIG__.apiUrl.replace(/\/$/, '');
  }
  return defaultApiUrl().replace(/\/$/, '');
}
