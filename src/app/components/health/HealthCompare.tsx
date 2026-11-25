import { Fragment, useMemo, useState } from 'react';
import { useI18n } from '../../context/i18n';
import { HEALTH_CATEGORIES, type HealthCategory } from '../../lib/health/catalog';
import { formatValue, type HealthReport, type ItemSeries, type Measurement } from '../../lib/health/model';
import { HEALTH_VALUE_COLORS, dateFormatter, healthValueColor } from '../fitness/theme';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { itemName } from './names';
import { UnitSwitch } from './UnitSwitch';

const ALL = 'all';
const UNIFIED = 'unified';
const MIN_SHARED_REPORTS = 2;

interface Props {
  /** Newest first. */
  reports: HealthReport[];
  series: ItemSeries[];
  selected: string | null;
  onSelect: (key: string) => void;
  /** Report whose units are shown; null = unified units. */
  unitsFrom: string | null;
  /** Also clears per-item choices. */
  onUnitsFromChange: (reportId: string | null) => void;
  onItemUnitChange: (key: string, target: string) => void;
}

/** Item × report matrix, newest report first, with the change against the previous report that has the item. */
export function HealthCompare({ reports, series, selected, onSelect, unitsFrom, onUnitsFromChange, onItemUnitChange }: Props) {
  const { t, locale } = useI18n();
  const h = t.fitness.health;
  const [category, setCategory] = useState<HealthCategory | typeof ALL>(ALL);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sharedOnly, setSharedOnly] = useState(false);

  const present = useMemo(() => HEALTH_CATEGORIES.filter((c) => series.some((s) => s.category === c)), [series]);
  const rows = series.filter((s) =>
    (category === ALL || s.category === category)
    && (!flaggedOnly || [...s.byReport.values()].some((m) => m.flag))
    && (!sharedOnly || s.byReport.size >= MIN_SHARED_REPORTS));
  const fmtDate = (d: string) => dateFormatter(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${d}T00:00`));

  const previousValue = (s: ItemSeries, index: number): number | null => {
    for (const older of reports.slice(index + 1)) {
      const v = s.byReport.get(older.id)?.value;
      if (v != null) return v;
    }
    return null;
  };

  const cell = (s: ItemSeries, m: Measurement | undefined, index: number) => {
    if (!m) return <span style={{ color: 'var(--muted-foreground)' }}>—</span>;
    const prev = m.value !== null ? previousValue(s, index) : null;
    const delta = prev !== null && m.value !== null ? m.value - prev : null;
    const tip = [
      m.converted ? `${h.original}: ${m.row.value} ${m.row.unit}` : '',
      m.row.range ? `${h.range}: ${m.row.range}${m.row.unit ? ` ${m.row.unit}` : ''}` : '',
      m.flag ? h.flags[m.flag] : '',
    ].filter(Boolean).join('\n');
    return (
      <span title={tip || undefined} className="inline-flex items-baseline gap-1.5">
        <span style={{ color: healthValueColor(m), fontWeight: m.flag ? 600 : undefined }}>
          {m.display}{m.flag === 'H' ? ' ↑' : m.flag === 'L' ? ' ↓' : m.flag === 'A' ? ' *' : ''}
        </span>
        {delta !== null && delta !== 0 && (
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {delta > 0 ? '+' : '−'}{formatValue(Math.abs(delta))}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Select value={category} onValueChange={(v) => setCategory(v as HealthCategory | typeof ALL)}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{h.allCategories}</SelectItem>
            {present.map((c) => <SelectItem key={c} value={c}>{h.categories[c]}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Checkbox id="health-flagged" checked={flaggedOnly} onCheckedChange={(v) => setFlaggedOnly(v === true)} />
          <Label htmlFor="health-flagged">{h.flaggedOnly}</Label>
        </div>
        {reports.length >= MIN_SHARED_REPORTS && (
          <div className="flex items-center gap-2">
            <Checkbox id="health-shared" checked={sharedOnly} onCheckedChange={(v) => setSharedOnly(v === true)} />
            <Label htmlFor="health-shared">{h.sharedOnly}</Label>
          </div>
        )}
        {reports.length >= MIN_SHARED_REPORTS && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <Label htmlFor="health-units" className="shrink-0">{h.units.label}</Label>
            <Select value={unitsFrom ?? UNIFIED} onValueChange={(v) => onUnitsFromChange(v === UNIFIED ? null : v)}>
              <SelectTrigger id="health-units" className="sm:w-auto"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={UNIFIED}>{h.units.unified}</SelectItem>
                {reports.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{h.units.report([fmtDate(r.date), r.facility].filter(Boolean).join(' '))}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        {(Object.keys(HEALTH_VALUE_COLORS) as (keyof typeof HEALTH_VALUE_COLORS)[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: HEALTH_VALUE_COLORS[k] }} />
            {h.legend[k]}
          </span>
        ))}
        <span>{h.legend.hint}</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{h.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-44">{h.item}</TableHead>
                {reports.map((r) => (
                  <TableHead key={r.id} className="min-w-32">
                    <div className="tabular-nums">{fmtDate(r.date)}</div>
                    <div className="text-xs font-normal truncate max-w-48" style={{ color: 'var(--muted-foreground)' }}>{r.facility}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s, i) => (
                <Fragment key={s.key}>
                  {(i === 0 || rows[i - 1].category !== s.category) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={reports.length + 1} className="pt-4 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        {h.categories[s.category]}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow
                    onClick={() => onSelect(s.key)}
                    className="cursor-pointer"
                    data-state={selected === s.key ? 'selected' : undefined}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: 'var(--foreground)' }}>{itemName(s, locale)}</span>
                        <UnitSwitch series={s} onChange={(target) => onItemUnitChange(s.key, target)} />
                      </div>
                    </TableCell>
                    {reports.map((r, index) => (
                      <TableCell key={r.id} className="tabular-nums whitespace-normal max-w-64">{cell(s, s.byReport.get(r.id), index)}</TableCell>
                    ))}
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
