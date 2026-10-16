import { useMemo } from 'react';
import { useI18n } from '../../context/i18n';
import type { Workout } from '../../lib/fitness/motra';
import { addDays, dailyMinutes, formatDay, weekStart } from '../../lib/fitness/stats';
import { HEATMAP_COLOR } from './theme';

const DAYS_PER_WEEK = 7;
/** Minute thresholds for intensity levels 1–4 (level 0 = no training). */
const LEVEL_THRESHOLDS = [1, 30, 60, 90];
const LEVEL_ALPHA = [0, 35, 60, 80, 100];

function level(minutes: number): number {
  return LEVEL_THRESHOLDS.filter((th) => minutes >= th).length;
}

function cellColor(lvl: number): string {
  return lvl === 0 ? 'var(--muted)' : `color-mix(in srgb, ${HEATMAP_COLOR} ${LEVEL_ALPHA[lvl]}%, transparent)`;
}

/** GitHub-style heatmap of training minutes per day over [start, end]. */
export function ActivityCalendar({ workouts, start, end }: { workouts: Workout[]; start: Date; end: Date }) {
  const { t } = useI18n();

  const days = useMemo(() => {
    const minutes = dailyMinutes(workouts);
    const out: { key: string; minutes: number; outside: boolean }[] = [];
    for (let d = weekStart(start); d < addDays(weekStart(end), DAYS_PER_WEEK); d = addDays(d, 1)) {
      const key = formatDay(d);
      out.push({ key, minutes: Math.round(minutes.get(key) ?? 0), outside: d < start || d > end });
    }
    return out;
  }, [workouts, start, end]);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto pb-1">
        <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
          {days.map((d) => (
            <div
              key={d.key}
              className="size-3.5 rounded-[3px]"
              style={{ background: d.outside ? 'transparent' : cellColor(level(d.minutes)) }}
              title={d.outside ? undefined : `${d.key} · ${d.minutes} ${t.fitness.units.min}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs self-end" style={{ color: 'var(--muted-foreground)' }}>
        {t.fitness.less}
        {LEVEL_ALPHA.map((_, i) => (
          <span key={i} className="size-3 rounded-[3px]" style={{ background: cellColor(i) }} />
        ))}
        {t.fitness.more}
      </div>
    </div>
  );
}
