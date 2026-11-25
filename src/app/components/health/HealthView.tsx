import { useMemo, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '../../context/i18n';
import { buildSeries, sortReports, type HealthReport, type ItemSeries } from '../../lib/health/model';
import { Section } from '../fitness/Section';
import { dateFormatter } from '../fitness/theme';
import { HealthCompare } from './HealthCompare';
import { HealthTrend } from './HealthTrend';

function flaggedIn(series: ItemSeries[], reportId: string): number {
  return series.filter((s) => s.byReport.get(reportId)?.flag).length;
}

function numericCount(s: ItemSeries): number {
  return [...s.byReport.values()].filter((m) => m.value !== null).length;
}

export function HealthView({ reports: unsorted }: { reports: HealthReport[] }) {
  const { t, locale } = useI18n();
  const h = t.fitness.health;
  const reports = useMemo(() => sortReports(unsorted), [unsorted]);
  const [unitsFrom, setUnitsFrom] = useState<string | null>(null);
  const series = useMemo(() => buildSeries(unsorted, unitsFrom), [unsorted, unitsFrom]);
  const [picked, setPicked] = useState<string | null>(null);
  const trendRef = useRef<HTMLDivElement>(null);
  const select = (key: string) => {
    setPicked(key);
    trendRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const fallback = series.reduce<ItemSeries | null>((best, s) => (numericCount(s) > (best ? numericCount(best) : 0) ? s : best), null);
  const selected = series.find((s) => s.key === picked) ?? fallback;
  const latest = reports[0];
  const fmtDate = (d: string) => dateFormatter(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${d}T00:00`));

  const stats = [
    { label: h.stats.reports, value: String(reports.length) },
    { label: h.stats.latest, value: fmtDate(latest.date) },
    { label: h.stats.flagged, value: String(flaggedIn(series, latest.id)) },
    { label: h.stats.items, value: String(series.length) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((it) => (
          <div key={it.label} className="rounded-xl border bg-card px-4 py-3">
            <div className="text-2xl font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>{it.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{it.label}</div>
          </div>
        ))}
      </div>

      <Section title={h.sections.reports}>
        <div className="grid gap-3 md:grid-cols-2">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>{fmtDate(r.date)}</span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{h.flaggedCount(flaggedIn(series, r.id))}</span>
              </div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{[r.title, r.facility].filter(Boolean).join(' · ')}</div>
              {r.summary && <p className="text-sm whitespace-pre-line" style={{ color: 'var(--foreground)', lineHeight: '1.6' }}>{r.summary}</p>}
              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 w-fit" style={{ color: 'var(--muted-foreground)' }}>
                  <ExternalLink className="size-3" />{h.openInNotion}
                </a>
              )}
            </div>
          ))}
        </div>
      </Section>

      <div ref={trendRef} className="scroll-mt-4">
        <Section title={h.sections.trend}>
          {selected && <HealthTrend series={selected} reports={reports} />}
          <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>{h.trendHint}</p>
        </Section>
      </div>

      <Section title={h.sections.compare}>
        <HealthCompare
          reports={reports}
          series={series}
          selected={selected?.key ?? null}
          onSelect={select}
          unitsFrom={unitsFrom}
          onUnitsFromChange={setUnitsFrom}
        />
      </Section>
    </div>
  );
}
