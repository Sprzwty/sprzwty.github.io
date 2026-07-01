import { TimelineEvent } from './TimelineEvent';
import { useI18n } from '../../context/i18n';
import type { LifeEvent } from '../../data/life-events';

interface TimelineProps {
  events: LifeEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const { locale } = useI18n();

  const byYear = events.reduce<Record<number, LifeEvent[]>>((acc, e) => {
    (acc[e.year] ??= []).push(e);
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  const yearLabel = (y: number) => (locale === 'ja' ? `${y}年` : locale === 'zh' ? `${y} 年` : String(y));

  let globalIdx = 0;

  return (
    <div className="relative">
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: 'var(--border)' }} />
      <div className="md:hidden absolute left-4 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />

      {years.map((year) => (
        <div key={year}>
          <div className="relative flex justify-start md:justify-center mb-6 pl-10 md:pl-0">
            <span
              className="inline-block px-4 py-1 rounded-full text-sm z-10"
              style={{ background: 'var(--foreground)', color: 'var(--background)', fontWeight: 'var(--font-weight-medium)' }}
            >
              {yearLabel(year)}
            </span>
          </div>

          {byYear[year].map((event) => {
            const side: 'left' | 'right' = globalIdx % 2 === 0 ? 'right' : 'left';
            globalIdx++;
            return (
              <TimelineEvent key={event.id} event={event} side={side} />
            );
          })}
        </div>
      ))}
    </div>
  );
}
