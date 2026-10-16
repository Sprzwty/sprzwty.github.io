import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../context/i18n';
import type { CalendarField } from '../../context/fitness-i18n';
import { ACTIVITY_TYPES, type ActivityType, type Workout } from '../../lib/fitness/motra';
import { muscleAbbr } from '../../lib/fitness/names';
import { shiftPeriod, type Period } from '../../lib/fitness/period';
import { addDays, formatDay, groupByDay, weekStart, workoutMuscles } from '../../lib/fitness/stats';
import { Button } from '../ui/button';
import { Chips, toggleInSet } from './Chips';
import { HrBar } from './HrBar';
import { WorkoutDetail } from './WorkoutDetail';
import { ACTIVITY_COLORS, TINT, dateFormatter, formatDuration, formatKilograms } from './theme';

const ALL_FIELDS: CalendarField[] = ['title', 'duration', 'calories', 'sets', 'volume', 'muscles', 'hr', 'effort'];
const DEFAULT_FIELDS: CalendarField[] = ['title', 'duration', 'calories', 'sets', 'volume', 'muscles'];
/** Fields that only make sense for strength sessions. */
const STRENGTH_FIELDS = new Set<CalendarField>(['sets', 'volume', 'muscles']);
const MAX_MUSCLES_IN_CELL = 3;
const DAYS_PER_WEEK = 7;
const WEEKS_SHOWN = 6;
/** Any Monday — only used to render localized weekday headers. */
const REFERENCE_MONDAY = new Date(2024, 0, 1);

function CellWorkout({ w, fields }: { w: Workout; fields: ReadonlySet<CalendarField> }) {
  const { t, locale } = useI18n();
  const show = (f: CalendarField) => fields.has(f) && (w.type === 'strength' || !STRENGTH_FIELDS.has(f));
  const metrics = [
    show('duration') && formatDuration(w.durationSec),
    show('calories') && `${w.calories} ${t.fitness.units.kcal}`,
    show('sets') && w.sets.length > 0 && `${w.sets.length} ${t.fitness.units.sets}`,
    show('volume') && w.volumeKg > 0 && formatKilograms(w.volumeKg),
    show('effort') && w.effort !== null && `${t.fitness.fields.effort} ${w.effort}`,
  ].filter(Boolean);
  const muscles = show('muscles') ? workoutMuscles(w).slice(0, MAX_MUSCLES_IN_CELL).map((m) => muscleAbbr(m, locale)) : [];

  return (
    <div
      className="rounded-md px-1.5 py-1 text-[11px] leading-snug text-left flex flex-col gap-0.5"
      style={{ background: `color-mix(in srgb, ${ACTIVITY_COLORS[w.type]} ${TINT}, transparent)`, borderLeft: `3px solid ${ACTIVITY_COLORS[w.type]}` }}
    >
      {show('title') && <span className="font-medium" style={{ color: 'var(--foreground)' }}>{t.fitness.activity[w.type]}</span>}
      {muscles.length > 0 && <span style={{ color: 'var(--foreground)' }}>{muscles.join('·')}</span>}
      {metrics.length > 0 && <span className="tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{metrics.join(' · ')}</span>}
      {show('hr') && w.hrZonesSec && <HrBar zonesSec={w.hrZonesSec} />}
    </div>
  );
}

export function MonthCalendar({ workouts }: { workouts: Workout[] }) {
  const { t, locale } = useI18n();
  const latest = workouts[workouts.length - 1]?.start ?? formatDay(new Date());
  const [month, setMonth] = useState<Period>({ granularity: 'month', year: Number(latest.slice(0, 4)), month: Number(latest.slice(5, 7)) });
  const [fields, setFields] = useState<ReadonlySet<CalendarField>>(new Set(DEFAULT_FIELDS));
  const types = ACTIVITY_TYPES.filter((ty) => workouts.some((w) => w.type === ty));
  const [shownTypes, setShownTypes] = useState<ReadonlySet<ActivityType>>(new Set(types));
  const [selected, setSelected] = useState<string | null>(null);

  const byDay = useMemo(() => groupByDay(workouts.filter((w) => shownTypes.has(w.type))), [workouts, shownTypes]);
  const first = new Date(month.year, month.month - 1, 1);
  const gridStart = weekStart(first);
  const days = Array.from({ length: WEEKS_SHOWN * DAYS_PER_WEEK }, (_, i) => addDays(gridStart, i));
  const todayKey = formatDay(new Date());
  const weekdays = Array.from({ length: DAYS_PER_WEEK }, (_, i) =>
    dateFormatter(locale, { weekday: 'short' }).format(addDays(REFERENCE_MONDAY, i)),
  );
  const selectedWorkouts = selected ? byDay.get(selected) ?? [] : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => setMonth(shiftPeriod(month, -1))} aria-label={t.fitness.period.prev}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-base font-medium min-w-32 text-center" style={{ color: 'var(--foreground)' }}>
          {dateFormatter(locale, { year: 'numeric', month: 'long' }).format(first)}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setMonth(shiftPeriod(month, 1))} aria-label={t.fitness.period.next}>
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            setMonth({ ...month, year: now.getFullYear(), month: now.getMonth() + 1 });
          }}
        >
          {t.fitness.calendar.today}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs w-16 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{t.fitness.calendar.show}</span>
          <Chips<CalendarField>
            options={ALL_FIELDS.map((f) => ({ value: f, label: t.fitness.fields[f] }))}
            selected={fields}
            onToggle={(f) => setFields(toggleInSet(fields, f))}
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs w-16 shrink-0" style={{ color: 'var(--muted-foreground)' }}>{t.fitness.calendar.activities}</span>
          <Chips<ActivityType>
            options={types.map((ty) => ({ value: ty, label: t.fitness.activity[ty], color: ACTIVITY_COLORS[ty] }))}
            selected={shownTypes}
            onToggle={(ty) => setShownTypes(toggleInSet(shownTypes, ty))}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[720px]">
          {weekdays.map((d) => (
            <div key={d} className="text-xs text-center py-1" style={{ color: 'var(--muted-foreground)' }}>{d}</div>
          ))}
          {days.map((d) => {
            const key = formatDay(d);
            const inMonth = d.getMonth() === month.month - 1;
            const dayWorkouts = inMonth ? byDay.get(key) ?? [] : [];
            const isSelected = key === selected;
            return (
              <button
                key={key}
                type="button"
                disabled={!inMonth}
                onClick={() => setSelected(isSelected ? null : key)}
                className="min-h-24 rounded-lg border p-1.5 flex flex-col gap-1 items-stretch text-left transition-colors disabled:cursor-default"
                style={{
                  opacity: inMonth ? 1 : 0.35,
                  borderColor: isSelected ? 'var(--foreground)' : 'var(--border)',
                  background: isSelected ? 'var(--accent)' : 'transparent',
                }}
              >
                <span
                  className="text-xs tabular-nums self-end rounded-full px-1.5"
                  style={{
                    color: key === todayKey ? 'var(--background)' : 'var(--muted-foreground)',
                    background: key === todayKey ? 'var(--foreground)' : 'transparent',
                  }}
                >
                  {d.getDate()}
                </span>
                {dayWorkouts.map((w) => (
                  <CellWorkout key={w.id} w={w} fields={fields} />
                ))}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {!selected && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t.fitness.calendar.selectDay}</p>}
        {selected && selectedWorkouts.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t.fitness.calendar.noWorkouts}</p>
        )}
        {selectedWorkouts.map((w) => (
          <div key={w.id} className="rounded-lg border p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="size-2.5 rounded-full" style={{ background: ACTIVITY_COLORS[w.type] }} />
              <span className="tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{w.start.slice(11, 16)}</span>
              <span className="font-medium" style={{ color: 'var(--foreground)' }}>{w.title}</span>
            </div>
            <WorkoutDetail workout={w} volumeInKg />
          </div>
        ))}
      </div>
    </div>
  );
}
