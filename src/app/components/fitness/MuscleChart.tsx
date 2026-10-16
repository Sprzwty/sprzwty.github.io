import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { useI18n } from '../../context/i18n';
import type { Workout } from '../../lib/fitness/motra';
import { muscleName } from '../../lib/fitness/names';
import { muscleSetCounts } from '../../lib/fitness/stats';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import { ACTIVITY_COLORS } from './theme';

const BAR_HEIGHT_PX = 26;

export function MuscleChart({ workouts }: { workouts: Workout[] }) {
  const { t, locale } = useI18n();
  const data = useMemo(
    () => muscleSetCounts(workouts).map((x) => ({ ...x, label: muscleName(x.muscle, locale) })),
    [workouts, locale],
  );
  const config: ChartConfig = { sets: { label: t.fitness.fields.sets, color: ACTIVITY_COLORS.strength } };

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: data.length * BAR_HEIGHT_PX + 16 }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={104} interval={0} />
        <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
        <Bar dataKey="sets" fill="var(--color-sets)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
