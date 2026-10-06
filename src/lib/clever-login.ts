/** University uses localePrefix: always and trailingSlash: true. */
export function universityCleverCallbackUrl(origin: string, locale: string): string {
  const base = String(origin || '').replace(/\/+$/, '');
  const loc = String(locale || 'en').trim() || 'en';
  return `${base}/${loc}/login/callback/`;
}
