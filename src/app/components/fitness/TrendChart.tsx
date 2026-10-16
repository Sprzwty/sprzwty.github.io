import { useMemo } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';
import { useI18n } from '../../context/i18n';
import { ACTIVITY_TYPES, type Workout } from '../../lib/fitness/motra';
import { trendSeries, type TrendBucket } from '../../lib/fitness/stats';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import { ACTIVITY_COLORS, LINE_COLOR } from './theme';

/** Stacked minutes per activity type plus a calories line, bucketed per day or week over [from, to]. */
export function TrendChart({ workouts, bucket, from, to }: { workouts: Workout[]; bucket: TrendBucket; from: string; to: string }) {
  const { t } = useI18n();
  const data = useMemo(() => trendSeries(workouts, bucket, from, to), [workouts, bucket, from, to]);
  const types = ACTIVITY_TYPES.filter((type) => workouts.some((w) => w.type === type));

  const config: ChartConfig = {
    ...Object.fromEntries(types.map((type) => [type, { label: t.fitness.activity[type], color: ACTIVITY_COLORS[type] }])),
    calories: { label: t.fitness.chart.calories, color: LINE_COLOR },
  };

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <ComposedChart data={data} margin={{ left: -8, right: -8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="key"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => (bucket === 'day' ? String(Number(v.slice(8))) : v.slice(5))}
          minTickGap={12}
        />
        <YAxis yAxisId="min" tickLine={false} axisLine={false} width={40} />
        <YAxis yAxisId="kcal" orientation="right" tickLine={false} axisLine={false} width={44} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {types.map((type, i) => (
          <Bar
            key={type}
            yAxisId="min"
            dataKey={type}
            stackId="minutes"
            fill={`var(--color-${type})`}
            radius={i === types.length - 1 ? [4, 4, 0, 0] : 0}
          />
        ))}
        <Line yAxisId="kcal" dataKey="calories" type="monotone" stroke="var(--color-calories)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
      </ComposedChart>
    </ChartContainer>
  );
}
