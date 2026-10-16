import { useI18n } from '../../context/i18n';
import type { Workout } from '../../lib/fitness/motra';
import { summarize } from '../../lib/fitness/stats';
import { formatVolume } from './theme';

export function StatCards({ workouts }: { workouts: Workout[] }) {
  const { t } = useI18n();
  const s = summarize(workouts);
  const items = [
    { label: t.fitness.stats.workouts, value: s.count.toLocaleString() },
    { label: t.fitness.stats.activeDays, value: s.activeDays.toLocaleString() },
    { label: t.fitness.stats.hours, value: (s.durationSec / 3600).toFixed(1) },
    { label: t.fitness.stats.calories, value: Math.round(s.calories).toLocaleString() },
    { label: t.fitness.stats.volume, value: formatVolume(s.volumeKg) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border bg-card px-4 py-3">
          <div className="text-2xl font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>{it.value}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}
