import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../context/i18n';
import type { Workout } from '../../lib/fitness/motra';
import { canShift, shiftPeriod, type Granularity, type Period } from '../../lib/fitness/period';
import { Button } from '../ui/button';
import { Chips } from './Chips';
import { dateFormatter } from './theme';

export function PeriodSelector({ period, onChange, workouts }: { period: Period; onChange: (p: Period) => void; workouts: Workout[] }) {
  const { t, locale } = useI18n();
  const label =
    period.granularity === 'year'
      ? dateFormatter(locale, { year: 'numeric' }).format(new Date(period.year, 0, 1))
      : dateFormatter(locale, { year: 'numeric', month: 'long' }).format(new Date(period.year, period.month - 1, 1));

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Chips<Granularity>
        options={(['all', 'year', 'month'] as const).map((g) => ({ value: g, label: t.fitness.period[g] }))}
        selected={period.granularity}
        onToggle={(granularity) => onChange({ ...period, granularity })}
      />
      {period.granularity !== 'all' && (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled={!canShift(period, -1, workouts)} onClick={() => onChange(shiftPeriod(period, -1))} aria-label={t.fitness.period.prev}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm min-w-28 text-center tabular-nums" style={{ color: 'var(--foreground)' }}>{label}</span>
          <Button variant="ghost" size="sm" disabled={!canShift(period, 1, workouts)} onClick={() => onChange(shiftPeriod(period, 1))} aria-label={t.fitness.period.next}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
