import { useI18n } from '../../context/i18n';
import { formatValue, type HealthReport, type ItemSeries, type Measurement } from '../../lib/health/model';
import { healthValueColor } from '../fitness/theme';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { itemName } from './names';

const FLAG_MARK = { H: ' ↑', L: ' ↓', A: ' *' };

function Detail({ label, children }: { label: string; children: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-2">
      <dt style={{ color: 'var(--muted-foreground)' }}>{label}</dt>
      <dd className="break-words whitespace-pre-line">{children}</dd>
    </div>
  );
}

const withUnit = (value: string, unit: string) => (unit ? `${value} ${unit}` : value);

/** A table value that opens its details (original value, reference range, flag) on tap, click or Enter. */
export function ValueCell({ series, m, report, delta }: { series: ItemSeries; m: Measurement; report: HealthReport; delta: number | null }) {
  const { t, locale } = useI18n();
  const h = t.fitness.health;
  const color = healthValueColor(m);
  const shown = withUnit(m.display, m.converted ? series.unit : m.row.unit);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex max-w-full items-baseline gap-1.5 rounded px-1 -mx-1 text-left text-sm cursor-pointer hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="line-clamp-2 break-words" style={{ color, fontWeight: m.flag ? 600 : undefined }}>
            {m.display}{m.flag ? FLAG_MARK[m.flag] : ''}
          </span>
          {delta !== null && delta !== 0 && (
            <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>
              {delta > 0 ? '+' : '−'}{formatValue(Math.abs(delta))}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] text-sm" align="start">
        <div className="font-medium" style={{ color: 'var(--foreground)' }}>{itemName(series, locale)}</div>
        <div className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
          {[report.date, report.facility].filter(Boolean).join(' · ')}
        </div>
        <dl className="flex flex-col gap-1.5">
          <Detail label={h.details.value}>{`${shown}${m.flag ? ` (${h.flags[m.flag]})` : ''}`}</Detail>
          {m.converted && <Detail label={h.original}>{withUnit(m.row.value, m.row.unit)}</Detail>}
          {m.row.range && <Detail label={h.range}>{withUnit(m.row.range, m.row.unit)}</Detail>}
          {m.convertedRange && <Detail label={h.convertedRange}>{withUnit(m.convertedRange, series.unit)}</Detail>}
        </dl>
      </PopoverContent>
    </Popover>
  );
}
