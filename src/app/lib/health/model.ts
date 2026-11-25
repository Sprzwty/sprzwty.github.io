import { HEALTH_CATEGORIES, HEALTH_ITEM_ORDER, HEALTH_ITEMS, type Conversion, type HealthCategory, type HealthItemDef } from './catalog.ts';

/** One row of a report's results table in Notion, kept verbatim. */
export interface HealthResultRow {
  key: string;
  item: string;
  value: string;
  unit: string;
  range: string;
  flag: string;
}

export interface HealthReport {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  facility: string;
  summary: string;
  url: string;
  results: HealthResultRow[];
}

export interface HealthDataset {
  version: 1;
  updatedAt: string;
  reports: HealthReport[];
}

/** H = above range, L = below range, A = abnormal (qualitative or flagged by the report). */
export type HealthFlag = 'H' | 'L' | 'A';

export interface Measurement {
  row: HealthResultRow;
  /** Numeric value in the item's display unit; null for qualitative results or unknown units. */
  value: number | null;
  /** Text shown in the comparison table. */
  display: string;
  converted: boolean;
  low: number | null;
  high: number | null;
  /** Reference range written in the display unit, only when the value was converted. */
  convertedRange: string | null;
  flag: HealthFlag | null;
}

/** `target` is a normalised unit; '' is the item's own unit. */
export interface UnitOption {
  target: string;
  label: string;
}

export interface ItemSeries {
  key: string;
  category: HealthCategory;
  /** Label of the unit the values are shown in. */
  unit: string;
  /** Normalised unit the values are shown in. */
  target: string;
  /** Units the item can be shown in; more than one means it can be switched. */
  options: UnitOption[];
  /** Item name as written on the most recent report; used when the key is not in the catalog. */
  fallbackName: string;
  byReport: Map<string, Measurement>;
}

const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const NEGATIVE_WORDS = new Set(['-', '阴性', '陰性', 'negative', 'neg', 'n', 'normal', '正常']);
const HIGH_FLAGS = new Set(['↑', 'h', 'high', '高']);
const LOW_FLAGS = new Set(['↓', 'l', 'low', '低']);
const RANGE_SPAN = /^(-?\d+(?:\.\d+)?)\s*[-~]\s*(-?\d+(?:\.\d+)?)$/;
const RANGE_BOUND = /^(<=?|>=?|≤|≥)?\s*(-?\d+(?:\.\d+)?)\s*(未満|以下|以上|超)?$/;
const NUMBER = /^(?:<=?|>=?|≤|≥)?\s*(-?\d+(?:\.\d+)?)$/;

function nfkc(s: string): string {
  return s.normalize('NFKC').trim();
}

/** "10⁴/μℓ" → "10^4/ul", "mg/㎗" → "mg/dl", "μmol/L" → "umol/l". */
export function normalizeUnit(unit: string): string {
  const exponents = unit.replace(/10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, sup: string) =>
    `10^${[...sup].map((c) => SUPERSCRIPT_DIGITS.indexOf(c)).join('')}`);
  return nfkc(exponents).toLowerCase().replace(/\s+/g, '').replace(/[μµ]/g, 'u');
}

export function parseNumber(value: string): number | null {
  const m = nfkc(value).replace(/,/g, '').match(NUMBER);
  return m ? Number(m[1]) : null;
}

interface Range { low: number | null; high: number | null; lowOpen: boolean; highOpen: boolean }

/** "3.9-6.1", "18.5～24.9", "130未満", "30以下", "40以上", "<3.4". Anything else → null. */
export function parseRange(range: string): Range | null {
  const s = nfkc(range);
  const span = s.match(RANGE_SPAN);
  if (span) return { low: Number(span[1]), high: Number(span[2]), lowOpen: false, highOpen: false };
  const bound = s.match(RANGE_BOUND);
  if (!bound || (!bound[1] && !bound[3])) return null;
  const n = Number(bound[2]);
  const op = bound[1] ?? bound[3];
  if (op === '<' || op === '未満') return { low: null, high: n, lowOpen: false, highOpen: true };
  if (op === '<=' || op === '≤' || op === '以下') return { low: null, high: n, lowOpen: false, highOpen: false };
  if (op === '>' || op === '超') return { low: n, high: null, lowOpen: true, highOpen: false };
  return { low: n, high: null, lowOpen: false, highOpen: false };
}

function isNegative(value: string): boolean {
  return NEGATIVE_WORDS.has(nfkc(value).toLowerCase().replace(/[()\s]/g, ''));
}

function explicitFlag(flag: string): HealthFlag | null {
  const f = nfkc(flag).toLowerCase();
  if (!f) return null;
  if (HIGH_FLAGS.has(f)) return 'H';
  if (LOW_FLAGS.has(f)) return 'L';
  return 'A';
}

function rangeFlag(value: number, r: Range): HealthFlag | null {
  if (r.high !== null && (r.highOpen ? value >= r.high : value > r.high)) return 'H';
  if (r.low !== null && (r.lowOpen ? value <= r.low : value < r.low)) return 'L';
  return null;
}

/** Significant-figure-ish rounding for converted values. */
export function formatValue(v: number): string {
  const abs = Math.abs(v);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return String(Number(v.toFixed(digits)));
}

/** "3.9–6.1", "< 131", "≥ 40": the converted bounds with the open/closed ends of the original range. */
function formatRange(r: Range, low: number | null, high: number | null): string {
  if (low !== null && high !== null) return `${formatValue(low)}–${formatValue(high)}`;
  if (high !== null) return `${r.highOpen ? '<' : '≤'} ${formatValue(high)}`;
  if (low !== null) return `${r.lowOpen ? '>' : '≥'} ${formatValue(low)}`;
  return '';
}

/** "10^12/l" → "10¹²/L", "umol/l" → "μmol/L". */
export function unitLabel(unit: string): string {
  return nfkc(unit)
    .replace(/\^(\d+)/g, (_, d: string) => [...d].map((c) => SUPERSCRIPT_DIGITS[Number(c)]).join(''))
    .replace(/(^|\/)u(?=mol|l)/gi, '$1μ')
    .replace(/([mdμ/]|^)l(?=\/|$)/g, '$1L');
}

const IDENTITY: Conversion = { factor: 1, to: (v) => v, back: (v) => v };

/** Conversion between a normalised unit and the item's unit; undefined when not convertible. */
function conversionFor(def: HealthItemDef | undefined, unit: string): Conversion | undefined {
  if (!def || unit === '' || unit === normalizeUnit(def.unit)) return IDENTITY;
  return def.from?.[unit];
}

/** `target` is a normalised unit to show the value in; empty means the item's unit. Flags always use the original unit. */
export function measure(row: HealthResultRow, target = ''): Measurement {
  const def = HEALTH_ITEMS[row.key];
  const raw = parseNumber(row.value);
  const range = parseRange(row.range);
  const source = conversionFor(def, normalizeUnit(row.unit));
  const shown = conversionFor(def, target);
  const comparable = raw !== null && source !== undefined && shown !== undefined;
  const same = source === shown || (source?.factor !== undefined && source.factor === shown?.factor);
  const toDisplay = (n: number) => (same ? n : shown!.back(source!.to(n)));
  const value = comparable && raw !== null ? toDisplay(raw) : null;

  let flag = explicitFlag(row.flag);
  if (flag === null && raw !== null && range) flag = rangeFlag(raw, range);
  if (flag === null && raw === null && row.range && isNegative(row.range) && !isNegative(row.value)) flag = 'A';

  const low = comparable && range?.low != null ? toDisplay(range.low) : null;
  const high = comparable && range?.high != null ? toDisplay(range.high) : null;
  const converted = value !== null && !same;

  return {
    row,
    value,
    display: value !== null && converted ? formatValue(value) : row.value,
    converted,
    low,
    high,
    convertedRange: converted && range ? formatRange(range, low, high) : null,
    flag,
  };
}

/** Newest first. */
export function sortReports(reports: HealthReport[]): HealthReport[] {
  return [...reports].sort((a, b) => b.date.localeCompare(a.date));
}

/** The unit `report` uses for an item, if it differs from the item's unit and is convertible. */
function unitIn(report: HealthReport | undefined, key: string): UnitOption | null {
  const def = HEALTH_ITEMS[key];
  const row = report?.results.find((r) => r.key === key);
  if (!def || !row) return null;
  const unit = normalizeUnit(row.unit);
  if (unit === '' || unit === normalizeUnit(def.unit) || !def.from?.[unit]) return null;
  return { target: unit, label: unitLabel(row.unit) };
}

/** Units chosen by the user: `from` is a report id (bulk), `items` overrides it per item key with a unit target. */
export interface UnitPrefs {
  from: string | null;
  items: Record<string, string>;
}

/** The item's own unit first, then every other convertible unit some report uses for it. */
function unitOptions(reports: HealthReport[], key: string): UnitOption[] {
  const def = HEALTH_ITEMS[key];
  if (!def) return [];
  const options: UnitOption[] = [{ target: '', label: def.unit }];
  for (const report of reports) {
    const own = unitIn(report, key);
    if (own && !options.some((o) => o.target === own.target)) options.push(own);
  }
  return options;
}

/**
 * One series per item key across all reports, in catalog order (unknown keys last, by first appearance).
 * Each item is shown in `prefs.items[key]` if it is still a valid unit, else in the unit of the report
 * `prefs.from` where convertible, else in the item's own unit.
 */
export function buildSeries(reports: HealthReport[], prefs: UnitPrefs = { from: null, items: {} }): ItemSeries[] {
  const unitSource = reports.find((r) => r.id === prefs.from);
  const series = new Map<string, ItemSeries>();
  for (const report of sortReports(reports)) {
    for (const row of report.results) {
      let s = series.get(row.key);
      if (!s) {
        const def = HEALTH_ITEMS[row.key];
        const options = unitOptions(reports, row.key);
        const chosen = options.find((o) => o.target === prefs.items[row.key]) ?? unitIn(unitSource, row.key) ?? options[0];
        s = {
          key: row.key,
          category: def?.category ?? 'other',
          unit: chosen?.label ?? row.unit,
          target: chosen?.target ?? '',
          options,
          fallbackName: row.item || row.key,
          byReport: new Map(),
        };
        series.set(row.key, s);
      }
      s.byReport.set(report.id, measure(row, s.target));
    }
  }
  const rank = (s: ItemSeries) => {
    const i = HEALTH_ITEM_ORDER.indexOf(s.key);
    return i >= 0 ? i : HEALTH_ITEM_ORDER.length;
  };
  return [...series.values()].sort((a, b) =>
    HEALTH_CATEGORIES.indexOf(a.category) - HEALTH_CATEGORIES.indexOf(b.category) || rank(a) - rank(b));
}
