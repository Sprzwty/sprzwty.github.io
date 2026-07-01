import type { Locale } from '../context/i18n';

/** A string (plain text or Markdown source) available in one or more locales. English is required as the fallback. */
export type LocalizedText = { en: string; zh?: string; ja?: string };

/** Resolve a localized string for the active locale, falling back to English. */
export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.en;
}
