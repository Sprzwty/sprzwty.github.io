import { useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { useI18n } from '../../context/i18n';
import type { Workout } from '../../lib/fitness/motra';
import { typeBreakdown } from '../../lib/fitness/stats';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import { ACTIVITY_COLORS, formatDuration } from './theme';

export function TypeChart({ workouts }: { workouts: Workout[] }) {
  const { t } = useI18n();
  const data = useMemo(() => typeBreakdown(workouts), [workouts]);
  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [d.type, { label: t.fitness.activity[d.type], color: ACTIVITY_COLORS[d.type] }]),
  );

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <ChartContainer config={config} className="aspect-square size-52 shrink-0">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="type" hideLabel />} />
          <Pie data={data} dataKey="count" nameKey="type" innerRadius="55%" strokeWidth={2}>
            {data.map((d) => (
              <Cell key={d.type} fill={`var(--color-${d.type})`} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="flex flex-col gap-2 text-sm w-full">
        {data.map((d) => (
          <li key={d.type} className="flex items-center gap-2">
            <span className="size-2.5 rounded-[2px] shrink-0" style={{ background: ACTIVITY_COLORS[d.type] }} />
            <span style={{ color: 'var(--foreground)' }}>{t.fitness.activity[d.type]}</span>
            <span className="ml-auto tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
              {d.count} · {formatDuration(d.minutes * 60)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
