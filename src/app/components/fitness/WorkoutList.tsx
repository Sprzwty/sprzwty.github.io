import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../../context/i18n';
import { ACTIVITY_TYPES, type ActivityType, type Workout } from '../../lib/fitness/motra';
import { exerciseName, muscleName } from '../../lib/fitness/names';
import { muscleSetCounts } from '../../lib/fitness/stats';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Chips } from './Chips';
import { Pager } from './Pager';
import { WorkoutDetail } from './WorkoutDetail';
import { ACTIVITY_COLORS, dateFormatter, formatDuration } from './theme';

const PAGE_SIZE = 15;
const ALL = 'all';

export function WorkoutRow({ workout }: { workout: Workout }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const when = dateFormatter(locale, { month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })
    .format(new Date(workout.start.replace(' ', 'T')));

  return (
    <li className="border-b last:border-b-0">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 py-3 text-left text-sm">
        <span className="size-2.5 rounded-full shrink-0" style={{ background: ACTIVITY_COLORS[workout.type] }} />
        <span className="tabular-nums shrink-0 w-36" style={{ color: 'var(--muted-foreground)' }}>{when}</span>
        <span className="truncate" style={{ color: 'var(--foreground)' }}>{workout.title}</span>
        <span className="ml-auto shrink-0 tabular-nums hidden sm:inline" style={{ color: 'var(--muted-foreground)' }}>
          {formatDuration(workout.durationSec)} · {workout.calories} {t.fitness.units.kcal}
          {workout.sets.length > 0 && ` · ${workout.sets.length} ${t.fitness.units.sets}`}
        </span>
        <ChevronDown className="size-4 shrink-0 transition-transform" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
      </button>
      {open && (
        <div className="pb-4 pl-5">
          <WorkoutDetail workout={workout} />
        </div>
      )}
    </li>
  );
}

export function WorkoutList({ workouts }: { workouts: Workout[] }) {
  const { t, locale } = useI18n();
  const [type, setType] = useState<ActivityType | typeof ALL>(ALL);
  const [muscle, setMuscle] = useState<string>(ALL);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const types = ACTIVITY_TYPES.filter((ty) => workouts.some((w) => w.type === ty));
  const muscles = useMemo(() => muscleSetCounts(workouts).map((x) => x.muscle), [workouts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...workouts].reverse().filter(
      (w) =>
        (type === ALL || w.type === type)
        && (muscle === ALL || w.sets.some((s) => s.muscles.includes(muscle)))
        && (q === ''
          || w.title.toLowerCase().includes(q)
          || w.sets.some((s) => s.exercise.toLowerCase().includes(q) || exerciseName(s.exercise, locale).toLowerCase().includes(q))),
    );
  }, [workouts, type, muscle, query, locale]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const resetPage = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <Chips<ActivityType | typeof ALL>
        options={[
          { value: ALL, label: t.fitness.log.all },
          ...types.map((ty) => ({ value: ty, label: t.fitness.activity[ty], color: ACTIVITY_COLORS[ty] })),
        ]}
        selected={type}
        onToggle={resetPage(setType)}
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <Input value={query} onChange={(e) => resetPage(setQuery)(e.target.value)} placeholder={t.fitness.log.search} className="sm:max-w-xs" />
        <Select value={muscle} onValueChange={resetPage(setMuscle)}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t.fitness.log.allMuscles}</SelectItem>
            {muscles.map((m) => (
              <SelectItem key={m} value={m}>{muscleName(m, locale)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm self-center sm:ml-auto" style={{ color: 'var(--muted-foreground)' }}>{t.fitness.log.count(filtered.length)}</span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>{t.fitness.log.empty}</p>
      ) : (
        <ul>
          {filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE).map((w) => (
            <WorkoutRow key={w.id} workout={w} />
          ))}
        </ul>
      )}
      <Pager page={current} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
