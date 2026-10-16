import { ACTIVITY_TYPES, type ActivityType, type Workout, type WorkoutSet } from './motra.ts';

export const HR_ZONE_COUNT = 5;
const EPLEY_REPS_DIVISOR = 30;

/** "YYYY-MM-DD" of a workout's local start time. */
export function dayKey(w: Workout): string {
  return w.start.slice(0, 10);
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDay(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** Monday of the week containing `date`. */
export function weekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function summarize(ws: Workout[]) {
  return {
    count: ws.length,
    durationSec: ws.reduce((s, w) => s + w.durationSec, 0),
    calories: ws.reduce((s, w) => s + w.calories, 0),
    volumeKg: ws.reduce((s, w) => s + w.volumeKg, 0),
    activeDays: new Set(ws.map(dayKey)).size,
  };
}

export function dailyMinutes(ws: Workout[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const w of ws) m.set(dayKey(w), (m.get(dayKey(w)) ?? 0) + w.durationSec / 60);
  return m;
}

export function groupByDay(ws: Workout[]): Map<string, Workout[]> {
  const m = new Map<string, Workout[]>();
  for (const w of ws) m.set(dayKey(w), [...(m.get(dayKey(w)) ?? []), w]);
  return m;
}

export type TrendBucket = 'day' | 'week';
export type TrendPoint = { key: string; calories: number } & Record<ActivityType, number>;

/** Minutes per activity type and total calories per bucket, gap-filled over [from, to] (day keys, inclusive). */
export function trendSeries(ws: Workout[], bucket: TrendBucket, from: string, to: string): TrendPoint[] {
  const bucketKey = (day: string) => (bucket === 'day' ? day : formatDay(weekStart(parseDay(day))));
  const empty = (key: string): TrendPoint =>
    ({ key, calories: 0, ...Object.fromEntries(ACTIVITY_TYPES.map((t) => [t, 0])) }) as TrendPoint;

  const byKey = new Map<string, TrendPoint>();
  for (const w of ws) {
    const key = bucketKey(dayKey(w));
    const point = byKey.get(key) ?? empty(key);
    point[w.type] += Math.round(w.durationSec / 60);
    point.calories += w.calories;
    byKey.set(key, point);
  }

  const step = bucket === 'day' ? 1 : 7;
  const series: TrendPoint[] = [];
  for (let d = parseDay(bucketKey(from)); formatDay(d) <= to; d = addDays(d, step)) {
    series.push(byKey.get(formatDay(d)) ?? empty(formatDay(d)));
  }
  return series;
}

export function typeBreakdown(ws: Workout[]) {
  return ACTIVITY_TYPES.map((type) => {
    const of = ws.filter((w) => w.type === type);
    return { type, count: of.length, minutes: Math.round(of.reduce((s, w) => s + w.durationSec, 0) / 60) };
  }).filter((x) => x.count > 0);
}

/** Total minutes per HR zone across all workouts that recorded heart rate. */
export function hrZoneMinutes(ws: Workout[]): number[] {
  const totals = new Array<number>(HR_ZONE_COUNT).fill(0);
  for (const w of ws) w.hrZonesSec?.forEach((s, i) => (totals[i] += s / 60));
  return totals.map(Math.round);
}

/** Working sets per muscle group (a set counts once for every muscle it lists), most trained first. */
export function muscleSetCounts(ws: Workout[]) {
  const m = new Map<string, number>();
  for (const w of ws) for (const s of w.sets) for (const mu of s.muscles) m.set(mu, (m.get(mu) ?? 0) + 1);
  return [...m.entries()].map(([muscle, sets]) => ({ muscle, sets })).sort((a, b) => b.sets - a.sets);
}

/** Muscle ids of one workout, most sets first. */
export function workoutMuscles(w: Workout): string[] {
  return muscleSetCounts([w]).map((x) => x.muscle);
}

/** Exercise names, most frequently trained first. */
export function exerciseNames(ws: Workout[]): string[] {
  const m = new Map<string, number>();
  for (const w of ws) for (const s of w.sets) m.set(s.exercise, (m.get(s.exercise) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

/** Epley estimate; 0 for sets without reps. */
export function estimatedOneRepMax(s: WorkoutSet): number {
  return s.reps > 0 ? s.weightKg * (1 + s.reps / EPLEY_REPS_DIVISOR) : 0;
}

export interface ExerciseSession {
  workoutId: string;
  date: string;
  sets: WorkoutSet[];
  maxWeight: number;
  volume: number;
  est1rm: number;
}

/** Every session of one exercise, newest first. */
export function exerciseHistory(ws: Workout[], exercise: string): ExerciseSession[] {
  const sessions: ExerciseSession[] = [];
  for (const w of ws) {
    const sets = w.sets.filter((s) => s.exercise === exercise);
    if (sets.length === 0) continue;
    sessions.push({
      workoutId: w.id,
      date: dayKey(w),
      sets,
      maxWeight: Math.max(...sets.map((s) => s.weightKg)),
      volume: sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0),
      est1rm: Math.max(...sets.map(estimatedOneRepMax)),
    });
  }
  return sessions.reverse();
}
