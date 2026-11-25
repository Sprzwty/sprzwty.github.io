import { useI18n } from '../../context/i18n';
import type { ItemSeries } from '../../lib/health/model';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

/** Select values cannot be empty, and '' is the item's own unit. */
const OWN = 'own';

/** The unit label, or a compact picker when the item can be shown in more than one unit. */
export function UnitSwitch({ series, onChange }: { series: ItemSeries; onChange: (target: string) => void }) {
  const { t } = useI18n();
  if (series.options.length < 2) {
    return series.unit ? <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{series.unit}</span> : null;
  }
  return (
    // Keep clicks (also those bubbling from the portalled menu) from selecting the table row.
    <span onClick={(e) => e.stopPropagation()}>
      <Select value={series.target || OWN} onValueChange={(v) => onChange(v === OWN ? '' : v)}>
        <SelectTrigger size="sm" aria-label={t.fitness.health.units.label} className="h-6 w-auto gap-1 px-2 py-0 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {series.options.map((o) => <SelectItem key={o.target || OWN} value={o.target || OWN}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </span>
  );
}
