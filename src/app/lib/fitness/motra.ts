import type { CellValue } from './xlsx.ts';

/** Motra "Export Workouts" sheet layout: one block per workout —
 *   <title>
 *   Workout Start | 2026-06-27 16:23:31
 *   ... key/value summary rows ...
 *   Heart Rate Zones / Zone 1..5 header / "1m 3s" durations   (optional)
 *   All Sets / Exercise header / one row per set              (rows optional)
 */

export type ActivityType = 'strength' | 'walk' | 'stairs' | 'run' | 'hike' | 'ride';

export const ACTIVITY_TYPES: ActivityType[] = ['strength', 'stairs', 'walk', 'run', 'hike', 'ride'];

export interface WorkoutSet {
  exercise: string;
  weightKg: number;
  reps: number;
  timeSec: number;
  distanceM: number;
  restSec: number;
  muscles: string[];
}

export interface Workout {
  id: string;
  title: string;
  type: ActivityType;
  /** Local time, "YYYY-MM-DD HH:mm:ss" as exported. */
  start: string;
  end: string;
  durationSec: number;
  calories: number;
  volumeKg: number;
  effort: number | null;
  /** Seconds spent in HR zones 1–5, or null when the workout has no HR data. */
  hrZonesSec: number[] | null;
  sets: WorkoutSet[];
}

const START_LABEL = 'Workout Start';
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 86_400_000;

const TYPE_PATTERNS: [RegExp, ActivityType][] = [
  [/stair/i, 'stairs'],
  [/\brun\b/i, 'run'],
  [/\bwalk\b/i, 'walk'],
  [/\bhike\b/i, 'hike'],
  [/\b(ride|cycling|bike)\b/i, 'ride'],
];

function str(v: CellValue | undefined): string {
  return v === null || v === undefined ? '' : String(v).trim();
}

function num(v: CellValue | undefined): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Accepts the exported text timestamp, or an Excel date serial if the file was re-saved in Excel. */
function timestamp(v: CellValue | undefined): string {
  if (typeof v !== 'number') return str(v);
  return new Date(EXCEL_EPOCH_MS + Math.round(v * MS_PER_DAY)).toISOString().slice(0, 19).replace('T', ' ');
}

/** "1h 2m 3s" / "45s" -> seconds. */
function zoneDuration(v: CellValue | undefined): number {
  const s = str(v);
  const part = (unit: string) => Number(s.match(new RegExp(`(\\d+)${unit}`))?.[1] ?? 0);
  return part('h') * 3600 + part('m') * 60 + part('s');
}

function classify(title: string, setCount: number): ActivityType {
  if (setCount > 0) return 'strength';
  return TYPE_PATTERNS.find(([re]) => re.test(title))?.[1] ?? 'strength';
}

function parseBlock(block: CellValue[][]): Workout {
  const title = str(block[0][0]);
  const meta = new Map<string, CellValue>();
  let hrZonesSec: number[] | null = null;
  const sets: WorkoutSet[] = [];

  for (let i = 1; i < block.length; i++) {
    const label = str(block[i][0]);
    if (label === 'Heart Rate Zones') {
      hrZonesSec = [0, 1, 2, 3, 4].map((z) => zoneDuration(block[i + 2]?.[z]));
      i += 2;
    } else if (label === 'Exercise' && str(block[i][1]).startsWith('Weight')) {
      for (let j = i + 1; j < block.length && str(block[j][0]) !== ''; j++) {
        const r = block[j];
        sets.push({
          exercise: str(r[0]),
          weightKg: num(r[1]),
          reps: num(r[2]),
          timeSec: Math.round(num(r[3])),
          distanceM: num(r[4]),
          restSec: num(r[5]),
          muscles: str(r[7]).split(',').map((m) => m.trim()).filter(Boolean),
        });
      }
      break;
    } else if (label !== '' && block[i][1] !== null && block[i][1] !== undefined) {
      meta.set(label, block[i][1]);
    }
  }

  const start = timestamp(meta.get(START_LABEL));
  const effort = meta.get('Effort');
  return {
    id: `${start}|${title}`,
    title,
    type: classify(title, sets.length),
    start,
    end: timestamp(meta.get('Workout End')),
    durationSec: num(meta.get('Total Duration (seconds)')),
    calories: num(meta.get('Burned Calories')),
    volumeKg: num(meta.get('Total TVL (kgs)')),
    effort: typeof effort === 'number' ? effort : null,
    hrZonesSec,
    sets,
  };
}

export function parseMotraRows(rows: CellValue[][]): Workout[] {
  const starts: number[] = [];
  for (let i = 0; i + 1 < rows.length; i++) {
    if (str(rows[i + 1]?.[0]) === START_LABEL) starts.push(i);
  }
  if (starts.length === 0) throw new Error('No workouts found — is this a Motra workouts export?');
  return starts.map((s, k) => parseBlock(rows.slice(s, starts[k + 1] ?? rows.length)));
}

/** Union by workout id; entries from `incoming` win. Result is sorted oldest → newest. */
export function mergeWorkouts(existing: Workout[], incoming: Workout[]): Workout[] {
  const byId = new Map(existing.map((w) => [w.id, w]));
  for (const w of incoming) byId.set(w.id, w);
  return [...byId.values()].sort((a, b) => a.start.localeCompare(b.start));
}
