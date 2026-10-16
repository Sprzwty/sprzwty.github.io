import { LOCALE_HTML_LANG, type Locale } from '../../context/i18n';
import type { ActivityType } from '../../lib/fitness/motra';

/** Per-theme values live in src/styles/fitness.css (separate light and dark palettes). */
export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  strength: 'var(--fitness-strength)',
  stairs: 'var(--fitness-stairs)',
  walk: 'var(--fitness-walk)',
  run: 'var(--fitness-run)',
  hike: 'var(--fitness-hike)',
  ride: 'var(--fitness-ride)',
};

/** Recovery → max. */
export const HR_ZONE_COLORS = [1, 2, 3, 4, 5].map((z) => `var(--fitness-hr-${z})`);

/** Background tint strength for coloured chips; stronger in dark mode. */
export const TINT = 'var(--fitness-tint)';

export const HEATMAP_COLOR = ACTIVITY_COLORS.stairs;
export const LINE_COLOR = 'var(--muted-foreground)';

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

const TONNE_KG = 1000;

/** 864 → "864 kg", 13887 → "13.9 t". */
export function formatVolume(kg: number): string {
  return kg >= TONNE_KG ? `${(kg / TONNE_KG).toFixed(1)} t` : `${Math.round(kg)} kg`;
}

/** Always kilograms, including values above one tonne. */
export function formatKilograms(kg: number): string {
  return `${Math.round(kg).toLocaleString()} kg`;
}

export function dateFormatter(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(LOCALE_HTML_LANG[locale], options);
}
