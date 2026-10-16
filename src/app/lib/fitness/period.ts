import type { Workout } from './motra.ts';

export type Granularity = 'all' | 'year' | 'month';

export interface Period {
  granularity: Granularity;
  year: number;
  /** 1–12; ignored unless granularity is 'month'. */
  month: number;
}

function monthIndex(year: number, month: number): number {
  return year * 12 + (month - 1);
}

export function periodOf(start: string, granularity: Granularity): Period {
  return { granularity, year: Number(start.slice(0, 4)), month: Number(start.slice(5, 7)) };
}

export function inPeriod(w: Workout, p: Period): boolean {
  if (p.granularity === 'all') return true;
  if (Number(w.start.slice(0, 4)) !== p.year) return false;
  return p.granularity === 'year' || Number(w.start.slice(5, 7)) === p.month;
}

export function shiftPeriod(p: Period, delta: number): Period {
  if (p.granularity === 'year') return { ...p, year: p.year + delta };
  const idx = monthIndex(p.year, p.month) + delta;
  return { ...p, year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

/** Whether shifting by `delta` stays within the months/years that contain data (`ws` sorted oldest → newest). */
export function canShift(p: Period, delta: number, ws: Workout[]): boolean {
  if (p.granularity === 'all' || ws.length === 0) return false;
  const target = shiftPeriod(p, delta);
  const first = periodOf(ws[0].start, p.granularity);
  const last = periodOf(ws[ws.length - 1].start, p.granularity);
  const key = (x: Period) => (p.granularity === 'year' ? x.year : monthIndex(x.year, x.month));
  return key(target) >= key(first) && key(target) <= key(last);
}
