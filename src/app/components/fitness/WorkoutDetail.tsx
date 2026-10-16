import { useI18n } from '../../context/i18n';
import type { Workout } from '../../lib/fitness/motra';
import { exerciseName, listSeparator, muscleName } from '../../lib/fitness/names';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { HrBar } from './HrBar';
import { formatDuration, formatKilograms, formatVolume } from './theme';

export function WorkoutDetail({ workout, volumeInKg = false }: { workout: Workout; volumeInKg?: boolean }) {
  const { t, locale } = useI18n();
  const c = t.fitness.columns;
  const f = t.fitness.fields;
  const volume = volumeInKg ? formatKilograms(workout.volumeKg) : formatVolume(workout.volumeKg);
  const facts = [
    [f.duration, formatDuration(workout.durationSec)],
    [f.calories, workout.calories.toLocaleString()],
    ...(workout.sets.length > 0 ? [[f.sets, String(workout.sets.length)], [f.volume, volume]] : []),
    ...(workout.effort !== null ? [[f.effort, `${workout.effort}/10`]] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {facts.map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt style={{ color: 'var(--muted-foreground)' }}>{label}</dt>
            <dd className="tabular-nums" style={{ color: 'var(--foreground)' }}>{value}</dd>
          </div>
        ))}
      </dl>

      {workout.hrZonesSec && (
        <div className="flex flex-col gap-1.5 max-w-md">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{f.hr}</span>
          <HrBar zonesSec={workout.hrZonesSec} className="h-2" />
        </div>
      )}

      {workout.sets.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{c.exercise}</TableHead>
                <TableHead className="text-right">{c.weight}</TableHead>
                <TableHead className="text-right">{c.reps}</TableHead>
                <TableHead className="text-right">{c.time}</TableHead>
                <TableHead className="text-right">{c.rest}</TableHead>
                <TableHead>{c.muscles}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workout.sets.map((s, i) => {
                const first = i === 0 || workout.sets[i - 1].exercise !== s.exercise;
                return (
                  <TableRow key={i} className={first ? 'border-t' : 'border-0'}>
                    <TableCell className="font-medium">{first ? exerciseName(s.exercise, locale) : ''}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.weightKg}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.reps}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.timeSec}s</TableCell>
                    <TableCell className="text-right tabular-nums">{s.restSec > 0 ? formatDuration(s.restSec) : '—'}</TableCell>
                    <TableCell style={{ color: 'var(--muted-foreground)' }}>
                      {first ? s.muscles.map((m) => muscleName(m, locale)).join(listSeparator(locale)) : ''}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
