import type { Locale } from '../../context/i18n';
import { HEALTH_ITEMS } from '../../lib/health/catalog';
import type { ItemSeries } from '../../lib/health/model';

export function itemName(s: ItemSeries, locale: Locale): string {
  return HEALTH_ITEMS[s.key]?.name[locale] ?? s.fallbackName;
}
