import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { MarkdownContent } from '../shared/MarkdownContent';
import { CollapsibleSection } from './CollapsibleSection';
import { ExpandToggleLabel, CollapseFooter } from './ExpandToggle';
import { useI18n, type Locale } from '../../context/i18n';
import { pick } from '../../lib/localized';
import { excerptFromMarkdown } from '../../lib/excerpt';
import { colorForCategory } from '../../lib/categoryColor';
import type { LifeEvent } from '../../data/life-events';

function formatMonth(year: number, month: number, day: number, locale: Locale) {
  const d = new Date(year, month - 1, day);
  if (locale === 'zh') return { day: String(day).padStart(2, '0'), month: d.toLocaleDateString('zh-CN', { month: 'long' }) };
  if (locale === 'ja') return { day: String(day), month: d.toLocaleDateString('ja-JP', { month: 'long' }) };
  return { day: String(day).padStart(2, '0'), month: d.toLocaleDateString('en-US', { month: 'long' }) };
}

interface ImpactEntryProps {
  event: LifeEvent;
  isLast: boolean;
}

function ImpactEntry({ event, isLast }: ImpactEntryProps) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const { day, month } = formatMonth(event.year, event.month, event.day, locale);
  const color = colorForCategory(event.category);
  const description = pick(event.description, locale);

  return (
    <article className="group">
      <div className="py-10 sm:py-14">
        {/* Toggle button holds only text — no nested links/images, so it stays valid + fully clickable. */}
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="block w-full text-left cursor-pointer">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-baseline gap-3">
              <span
                className="text-7xl sm:text-8xl tabular-nums select-none"
                style={{ color: 'var(--muted-foreground)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1, opacity: 0.25 }}
              >
                {day}
              </span>
              <span className="text-xl sm:text-2xl" style={{ color: 'var(--muted-foreground)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1 }}>
                {month}
              </span>
            </div>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs shrink-0 border mt-1"
              style={{ color, borderColor: color, background: 'transparent', fontWeight: 'var(--font-weight-medium)' }}
            >
              {event.category}
            </span>
          </div>

          <h2
            className="text-3xl sm:text-4xl mb-3"
            style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2, letterSpacing: '-0.02em' }}
          >
            {pick(event.title, locale)}
          </h2>

          {!open && (
            <p className="max-w-2xl text-base sm:text-lg mb-2" style={{ color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
              {excerptFromMarkdown(description, 160)}
            </p>
          )}

          <ExpandToggleLabel open={open} expandLabel={t.life.expand} collapseLabel={t.life.collapse} className="text-sm" />
        </button>

        <motion.div
          initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <div className="pt-5">
            <MarkdownContent content={description} className="max-w-2xl text-base sm:text-lg" />

            {event.imageUrl && (
              <div className="mt-8 aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden">
                <ImageWithFallback src={event.imageUrl} alt={pick(event.title, locale)} className="w-full h-full object-cover" />
              </div>
            )}
            {open && <CollapseFooter collapseLabel={t.life.collapse} onCollapse={() => setOpen(false)} className="max-w-2xl" />}
          </div>
        </motion.div>
      </div>

      {!isLast && <div className="h-px w-full" style={{ background: 'var(--border)' }} />}
    </article>
  );
}

interface ImpactViewProps {
  events: LifeEvent[];
}

export function ImpactView({ events }: ImpactViewProps) {
  const { locale, t } = useI18n();

  const byYear = events.reduce<Record<number, LifeEvent[]>>((acc, e) => {
    (acc[e.year] ??= []).push(e);
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);
  const latestYear = years[0];

  const yearLabel = (y: number) => (locale === 'ja' ? `${y}年` : locale === 'zh' ? `${y} 年` : String(y));

  return (
    <div>
      {years.map((year) => (
        <CollapsibleSection
          key={year}
          defaultOpen={year === latestYear}
          header={({ open }) => (
            <div className="flex items-center gap-4 py-6 sticky top-14 sm:top-16 z-10 transition-opacity hover:opacity-80" style={{ background: 'var(--background)' }}>
              <span
                className="text-5xl sm:text-6xl"
                style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)', letterSpacing: '-0.03em', lineHeight: 1 }}
              >
                {yearLabel(year)}
              </span>
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {t.life.entryCount(byYear[year].length)}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                <ChevronDown className="size-5" />
              </motion.span>
            </div>
          )}
        >
          {byYear[year].map((event, i) => (
            <ImpactEntry key={event.id} event={event} isLast={i === byYear[year].length - 1} />
          ))}
        </CollapsibleSection>
      ))}
    </div>
  );
}
