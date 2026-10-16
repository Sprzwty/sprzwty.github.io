import { useMemo, useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';
import { useI18n } from '../../context/i18n';
import type { Workout } from '../../lib/fitness/motra';
import { exerciseName, muscleName } from '../../lib/fitness/names';
import { exerciseHistory, exerciseNames, muscleSetCounts } from '../../lib/fitness/stats';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Pager } from './Pager';
import { ACTIVITY_COLORS, HR_ZONE_COLORS, dateFormatter, formatVolume } from './theme';

const PAGE_SIZE = 10;
const ALL = 'all';

export function ExerciseHistory({ workouts }: { workouts: Workout[] }) {
  const { t, locale } = useI18n();
  const e = t.fitness.exercise;
  const [muscle, setMuscle] = useState<string>(ALL);
  const [picked, setPicked] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const muscles = useMemo(() => muscleSetCounts(workouts).map((x) => x.muscle), [workouts]);
  const names = useMemo(() => {
    const all = exerciseNames(workouts);
    if (muscle === ALL) return all;
    const withMuscle = new Set(workouts.flatMap((w) => w.sets).filter((s) => s.muscles.includes(muscle)).map((s) => s.exercise));
    return all.filter((n) => withMuscle.has(n));
  }, [workouts, muscle]);
  const exercise = picked && names.includes(picked) ? picked : names[0];
  const sessions = useMemo(() => (exercise ? exerciseHistory(workouts, exercise) : []), [workouts, exercise]);
  const chartData = useMemo(() => [...sessions].reverse().map((s) => ({ ...s, est1rm: Math.round(s.est1rm) })), [sessions]);

  if (!exercise) return null;

  const pr = sessions.reduce((best, s) => (s.maxWeight > best.maxWeight ? s : best), sessions[0]);
  const fmtDate = (d: string) => dateFormatter(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${d}T00:00`));
  const summary = [
    [e.sessions, String(sessions.length)],
    [e.totalSets, String(sessions.reduce((n, s) => n + s.sets.length, 0))],
    [e.totalVolume, formatVolume(sessions.reduce((n, s) => n + s.volume, 0))],
    [e.maxWeight, `${pr.maxWeight} kg · ${fmtDate(pr.date)}`],
    [e.best1rm, `${Math.round(Math.max(...sessions.map((s) => s.est1rm)))} kg`],
    [e.lastDone, fmtDate(sessions[0].date)],
  ];
  const config: ChartConfig = {
    maxWeight: { label: t.fitness.chart.maxWeight, color: ACTIVITY_COLORS.strength },
    est1rm: { label: t.fitness.chart.est1rm, color: HR_ZONE_COLORS[3] },
    volume: { label: t.fitness.chart.volume, color: ACTIVITY_COLORS.stairs },
  };
  const pageCount = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={muscle} onValueChange={(m) => { setMuscle(m); setPage(1); }}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{e.allMuscles}</SelectItem>
            {muscles.map((m) => <SelectItem key={m} value={m}>{muscleName(m, locale)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={exercise} onValueChange={(x) => { setPicked(x); setPage(1); }}>
          <SelectTrigger className="sm:w-80"><SelectValue /></SelectTrigger>
          <SelectContent>
            {names.map((n) => <SelectItem key={n} value={n}>{exerciseName(n, locale)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {summary.map(([label, value]) => (
          <div key={label} className="rounded-lg border px-3 py-2">
            <dt className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</dt>
            <dd className="text-sm font-medium tabular-nums mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</dd>
          </div>
        ))}
      </dl>

      <ChartContainer config={config} className="aspect-auto h-64 w-full">
        <ComposedChart data={chartData} margin={{ left: -8, right: -8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} minTickGap={16} />
          <YAxis yAxisId="vol" orientation="right" tickLine={false} axisLine={false} width={48} />
          <YAxis yAxisId="kg" tickLine={false} axisLine={false} width={40} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar yAxisId="vol" dataKey="volume" fill="var(--color-volume)" fillOpacity={0.45} radius={[4, 4, 0, 0]} />
          <Line yAxisId="kg" dataKey="maxWeight" type="monotone" stroke="var(--color-maxWeight)" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="kg" dataKey="est1rm" type="monotone" stroke="var(--color-est1rm)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
        </ComposedChart>
      </ChartContainer>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{e.date}</TableHead>
              <TableHead>{e.sets}</TableHead>
              <TableHead className="text-right">{e.topSet}</TableHead>
              <TableHead className="text-right">{t.fitness.chart.volume}</TableHead>
              <TableHead className="text-right">{t.fitness.chart.est1rm}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE).map((s) => {
              const top = s.sets.reduce((a, b) => (b.weightKg > a.weightKg || (b.weightKg === a.weightKg && b.reps > a.reps) ? b : a));
              return (
                <TableRow key={s.workoutId}>
                  <TableCell className="tabular-nums whitespace-nowrap">{fmtDate(s.date)}</TableCell>
                  <TableCell className="tabular-nums whitespace-normal min-w-48" style={{ color: 'var(--muted-foreground)' }}>
                    {s.sets.map((x) => `${x.weightKg}×${x.reps}`).join(' · ')}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">{top.weightKg} kg × {top.reps}</TableCell>
                  <TableCell className="text-right tabular-nums">{Math.round(s.volume).toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{Math.round(s.est1rm)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Pager page={current} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
