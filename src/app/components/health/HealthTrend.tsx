import { CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis } from 'recharts';
import { useI18n } from '../../context/i18n';
import { formatValue, type HealthReport, type ItemSeries } from '../../lib/health/model';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import { ACTIVITY_COLORS, HEALTH_VALUE_COLORS, healthValueColor } from '../fitness/theme';
import { itemName } from './names';
import { UnitSwitch } from './UnitSwitch';

/** One numeric item over time; the shaded band is the reference range of the most recent report. */
export function HealthTrend({ series, reports, onUnitChange }: { series: ItemSeries; reports: HealthReport[]; onUnitChange: (target: string) => void }) {
  const { t, locale } = useI18n();
  const h = t.fitness.health;
  const points = [...reports]
    .reverse()
    .map((r) => ({ date: r.date, m: series.byReport.get(r.id) }))
    .filter((p) => p.m?.value != null)
    .map((p) => {
      const m = p.m!;
      return {
        date: p.date,
        value: Number(formatValue(m.value!)),
        low: m.low,
        high: m.high,
        color: healthValueColor(m),
        original: m.converted ? `${m.row.value} ${m.row.unit}`.trim() : null,
        range: m.converted
          ? (m.convertedRange ? `${m.convertedRange} ${series.unit}`.trim() : '')
          : `${m.row.range} ${m.row.unit}`.trim(),
      };
    });

  if (points.length === 0) {
    return <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{h.notNumeric}</p>;
  }

  const latest = points[points.length - 1];
  const label = `${itemName(series, locale)}${series.unit ? ` (${series.unit})` : ''}`;
  const config: ChartConfig = { value: { label, color: ACTIVITY_COLORS.strength } };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
        {itemName(series, locale)}
        <UnitSwitch series={series} onChange={onUnitChange} />
      </div>
      <ChartContainer config={config} className="aspect-auto h-56 sm:h-64 w-full">
        <LineChart data={points} margin={{ left: 0, right: 16, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={56} domain={['auto', 'auto']} />
          {(latest.low !== null || latest.high !== null) && (
            <ReferenceArea
              y1={latest.low ?? undefined}
              y2={latest.high ?? undefined}
              ifOverflow="extendDomain"
              fill={ACTIVITY_COLORS.stairs}
              fillOpacity={0.12}
              strokeOpacity={0}
            />
          )}
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name, _item, _index, p: (typeof points)[number]) => (
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono font-medium tabular-nums" style={{ color: p.color }}>{value}</span>
                    </div>
                    {p.original && <span className="text-muted-foreground">{h.original}: {p.original}</span>}
                    {p.range && <span className="text-muted-foreground">{h.range}: {p.range}</span>}
                  </div>
                )}
              />
            }
          />
          <Line
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={({ cx, cy, payload, index }) => (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={4}
                fill={payload.color === HEALTH_VALUE_COLORS.original ? 'var(--color-value)' : payload.color}
                stroke="var(--background)"
                strokeWidth={1.5}
              />
            )}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
