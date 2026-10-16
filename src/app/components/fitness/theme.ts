import { LOCALE_HTML_LANG, type Locale } from '../../context/i18n';
import type { ActivityType } from '../../lib/fitness/motra';

/** Muted, low-saturation palette that reads on both light and dark backgrounds. */
export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  strength: '#7f95b5',
  stairs: '#8fb3a0',
  walk: '#cdb48a',
  run: '#c79486',
  hike: '#a896b8',
  ride: '#86aeb3',
};

/** Recovery → max, desaturated. */
export const HR_ZONE_COLORS = ['#a7adb6', '#8fabc6', '#93b8a0', '#d2ae82', '#c98e8e'];

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

export function dateFormatter(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(LOCALE_HTML_LANG[locale], options);
}
