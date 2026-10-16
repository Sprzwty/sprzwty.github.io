import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Eye, Lock } from 'lucide-react';
import { ActivityCalendar } from '../components/fitness/ActivityCalendar';
import { ExerciseHistory } from '../components/fitness/ExerciseHistory';
import { HeartRateChart } from '../components/fitness/HeartRateChart';
import { MonthCalendar } from '../components/fitness/MonthCalendar';
import { MuscleChart } from '../components/fitness/MuscleChart';
import { PasswordGate } from '../components/fitness/PasswordGate';
import { PeriodSelector } from '../components/fitness/PeriodSelector';
import { Section } from '../components/fitness/Section';
import { StatCards } from '../components/fitness/StatCards';
import { TrendChart } from '../components/fitness/TrendChart';
import { TypeChart } from '../components/fitness/TypeChart';
import { WorkoutList } from '../components/fitness/WorkoutList';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useI18n } from '../context/i18n';
import type { EncryptedPayload } from '../lib/fitness/crypto';
import { fetchEncryptedDataset, readWorkoutsFromXlsx } from '../lib/fitness/dataset';
import { mergeWorkouts, type Workout } from '../lib/fitness/motra';
import { inPeriod, periodOf, type Period } from '../lib/fitness/period';
import { addDays, dayKey, formatDay, parseDay } from '../lib/fitness/stats';
import { useDocumentTitle } from '../lib/useDocumentTitle';

type Load = { state: 'loading' } | { state: 'error'; message: string } | { state: 'ready'; payload: EncryptedPayload | null };

const HEATMAP_MAX_DAYS = 7 * 53;
const PANEL_CLASS = 'rounded-xl border bg-card p-4 sm:p-6';

function minDay(a: string, b: string): string {
  return a < b ? a : b;
}

function Overview({ workouts }: { workouts: Workout[] }) {
  const { t } = useI18n();
  const [period, setPeriod] = useState<Period>(() => periodOf(workouts[workouts.length - 1].start, 'all'));
  const ws = useMemo(() => workouts.filter((w) => inPeriod(w, period)), [workouts, period]);

  const today = formatDay(new Date());
  const lastDay = dayKey(workouts[workouts.length - 1]);
  let from: string;
  let to: string;
  if (period.granularity === 'month') {
    from = formatDay(new Date(period.year, period.month - 1, 1));
    to = formatDay(new Date(period.year, period.month, 0));
  } else if (period.granularity === 'year') {
    from = `${period.year}-01-01`;
    to = minDay(`${period.year}-12-31`, lastDay);
  } else {
    from = dayKey(workouts[0]);
    to = lastDay;
  }
  const heatmapEnd = minDay(period.granularity === 'year' ? `${period.year}-12-31` : today, today);
  const heatmapStart = period.granularity === 'year'
    ? from
    : formatDay(new Date(Math.max(parseDay(from).getTime(), addDays(parseDay(heatmapEnd), -HEATMAP_MAX_DAYS).getTime())));

  return (
    <div className="flex flex-col gap-6">
      <PeriodSelector period={period} onChange={setPeriod} workouts={workouts} />
      <StatCards workouts={ws} />
      {period.granularity !== 'month' && (
        <Section title={t.fitness.sections.heatmap}>
          <ActivityCalendar workouts={ws} start={parseDay(heatmapStart)} end={parseDay(heatmapEnd)} />
        </Section>
      )}
      <Section title={t.fitness.sections.trend}>
        <TrendChart workouts={ws} bucket={period.granularity === 'month' ? 'day' : 'week'} from={from} to={to} />
      </Section>
      <div className="grid gap-6 md:grid-cols-2">
        <Section title={t.fitness.sections.types}><TypeChart workouts={ws} /></Section>
        {ws.some((w) => w.hrZonesSec) && <Section title={t.fitness.sections.hr}><HeartRateChart workouts={ws} /></Section>}
      </div>
      {ws.some((w) => w.sets.length > 0) && (
        <Section title={t.fitness.sections.muscles}><MuscleChart workouts={ws} /></Section>
      )}
    </div>
  );
}

export function FitnessPage() {
  const { t } = useI18n();
  useDocumentTitle(t.fitness.title);
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEncryptedDataset()
      .then((payload) => setLoad({ state: 'ready', payload }))
      .catch((err) => setLoad({ state: 'error', message: String(err) }));
  }, []);

  const handlePreview = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const base = workouts ?? [];
      const merged = mergeWorkouts(base, await readWorkoutsFromXlsx(file));
      setWorkouts(merged);
      setNotice(`${t.fitness.preview.result(merged.length - base.length, merged.length)} ${t.fitness.preview.hint}`);
    } catch (err) {
      setNotice(`${t.fitness.preview.failed} ${String(err)}`);
    }
  };

  const unlocked = workouts !== null && workouts.length > 0;
  const noData = load.state === 'ready' && load.payload === null && !unlocked;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 style={{ color: 'var(--foreground)' }}>{t.fitness.title}</h1>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)', lineHeight: '1.75' }}>{t.fitness.subtitle}</p>
        </div>
        {(unlocked || noData) && (
          <div className="flex gap-2 flex-wrap">
            <input ref={fileInput} type="file" accept=".xlsx" hidden onChange={handlePreview} />
            <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
              <Eye className="size-4" />{t.fitness.preview.button}
            </Button>
            {unlocked && (
              <Button variant="ghost" size="sm" onClick={() => { setWorkouts(null); setNotice(null); }}>
                <Lock className="size-4" />{t.fitness.lock}
              </Button>
            )}
          </div>
        )}
      </div>

      {notice && (
        <div className="rounded-lg border px-4 py-3 text-sm mb-6" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>{notice}</div>
      )}
      {load.state === 'error' && <p style={{ color: 'var(--destructive)' }}>{load.message}</p>}
      {noData && <p className="text-sm" style={{ color: 'var(--muted-foreground)', lineHeight: '1.75' }}>{t.fitness.noData}</p>}
      {load.state === 'ready' && load.payload && !unlocked && (
        <PasswordGate payload={load.payload} onUnlock={(ws) => setWorkouts(mergeWorkouts([], ws))} />
      )}

      {unlocked && workouts && (
        <Tabs defaultValue="overview" className="gap-6">
          <TabsList>
            <TabsTrigger value="overview">{t.fitness.tabs.overview}</TabsTrigger>
            <TabsTrigger value="calendar">{t.fitness.tabs.calendar}</TabsTrigger>
            <TabsTrigger value="exercises">{t.fitness.tabs.exercises}</TabsTrigger>
            <TabsTrigger value="log">{t.fitness.tabs.log}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><Overview workouts={workouts} /></TabsContent>
          <TabsContent value="calendar"><div className={PANEL_CLASS}><MonthCalendar workouts={workouts} /></div></TabsContent>
          <TabsContent value="exercises"><div className={PANEL_CLASS}><ExerciseHistory workouts={workouts} /></div></TabsContent>
          <TabsContent value="log"><div className={PANEL_CLASS}><WorkoutList workouts={workouts} /></div></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
