import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { CollapsibleSection } from './CollapsibleSection';
import { TimelineEvent } from './TimelineEvent';
import { useI18n } from '../../context/i18n';
import type { LifeEvent } from '../../data/life-events';

interface TimelineProps {
  events: LifeEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const { locale, t } = useI18n();

  const byYear = events.reduce<Record<number, LifeEvent[]>>((acc, e) => {
    (acc[e.year] ??= []).push(e);
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);
  const latestYear = years[0];

  const yearLabel = (y: number) => (locale === 'ja' ? `${y}年` : locale === 'zh' ? `${y} 年` : String(y));

  let globalIdx = 0;

  return (
    <div className="relative">
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: 'var(--border)' }} />
      <div className="md:hidden absolute left-4 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />

      {years.map((year) => (
        <CollapsibleSection
          key={year}
          defaultOpen={year === latestYear}
          header={({ open }) => (
            <div className="relative flex items-center justify-start md:justify-center gap-2 mb-6 pl-10 md:pl-0">
              <span
                className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm z-10 transition-opacity hover:opacity-80"
                style={{ background: 'var(--foreground)', color: 'var(--background)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {yearLabel(year)}
                <span style={{ opacity: 0.6 }}>· {t.life.entryCount(byYear[year].length)}</span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex">
                  <ChevronDown className="size-3.5" />
                </motion.span>
              </span>
            </div>
          )}
        >
          {byYear[year].map((event) => {
            const side: 'left' | 'right' = globalIdx % 2 === 0 ? 'right' : 'left';
            globalIdx++;
            return <TimelineEvent key={event.id} event={event} side={side} />;
          })}
        </CollapsibleSection>
      ))}
    </div>
  );
}
