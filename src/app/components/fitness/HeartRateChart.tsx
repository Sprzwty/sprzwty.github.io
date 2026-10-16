import { useMemo } from 'react';
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import { useI18n } from '../../context/i18n';
import type { Workout } from '../../lib/fitness/motra';
import { hrZoneMinutes } from '../../lib/fitness/stats';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import { HR_ZONE_COLORS } from './theme';

export function HeartRateChart({ workouts }: { workouts: Workout[] }) {
  const { t } = useI18n();
  const data = useMemo(
    () => hrZoneMinutes(workouts).map((minutes, i) => ({ zone: t.fitness.zone(i + 1), minutes })),
    [workouts, t],
  );
  const config: ChartConfig = { minutes: { label: t.fitness.chart.minutes } };

  return (
    <ChartContainer config={config} className="aspect-auto h-52 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="zone" tickLine={false} axisLine={false} width={64} />
        <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
        <Bar dataKey="minutes" radius={4}>
          {data.map((d, i) => (
            <Cell key={d.zone} fill={HR_ZONE_COLORS[i]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
