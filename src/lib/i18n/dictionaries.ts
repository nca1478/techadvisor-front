import { normalizeLocale, type Locale } from './config';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
};

/** Loads the UI dictionary for a locale (falls back to the default). */
export function getDictionary(locale: string): Promise<Dictionary> {
  return Promise.resolve(getDictionarySync(locale));
}

/** Synchronous access for server and client components. */
export function getDictionarySync(locale: string): Dictionary {
  return dictionaries[normalizeLocale(locale)];
}
