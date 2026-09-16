import type { AbstractIntlMessages } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing, type AppLocale } from './routing';

type Messages = Record<string, unknown>;

/** Deep-merges `override` onto `base` — used so a locale missing keys falls
 * back to the English string instead of next-intl throwing/blank-rendering. */
function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const key of Object.keys(override)) {
    const b = base[key];
    const o = override[key];
    if (b && o && typeof b === 'object' && typeof o === 'object' && !Array.isArray(b) && !Array.isArray(o)) {
      out[key] = deepMerge(b as Messages, o as Messages);
    } else {
      out[key] = o;
    }
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: AppLocale = routing.locales.includes(requested as AppLocale)
    ? (requested as AppLocale)
    : routing.defaultLocale;

  const en = (await import('./messages/en.json')).default as Messages;
  const messages = locale === 'en' ? en : deepMerge(en, ((await import(`./messages/${locale}.json`)).default as Messages));

  return { locale, messages: messages as AbstractIntlMessages };
});
