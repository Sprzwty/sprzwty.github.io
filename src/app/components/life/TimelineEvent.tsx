import { ImageWithFallback } from '../figma/ImageWithFallback';
import { MarkdownContent } from '../shared/MarkdownContent';
import { useI18n, type Locale } from '../../context/i18n';
import { pick } from '../../lib/localized';
import { colorForCategory } from '../../lib/categoryColor';
import type { LifeEvent } from '../../data/life-events';

interface TimelineEventProps {
  event: LifeEvent;
  side: 'left' | 'right';
}

function formatDate(year: number, month: number, day: number, locale: Locale) {
  const d = new Date(year, month - 1, day);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  if (locale === 'zh') return d.toLocaleDateString('zh-CN', opts);
  if (locale === 'ja') return d.toLocaleDateString('ja-JP', opts);
  return d.toLocaleDateString('en-US', opts);
}

export function TimelineEvent({ event, side }: TimelineEventProps) {
  const { locale } = useI18n();
  const color = colorForCategory(event.category);
  const dateStr = formatDate(event.year, event.month, event.day, locale);

  return (
    <div
      className={`group relative flex items-start mb-10 pl-10 md:pl-0 ${
        side === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'
      }`}
    >
      <div
        className={`w-full md:w-[calc(50%-2rem)] rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow ${
          side === 'left' ? 'md:mr-8' : 'md:ml-8'
        }`}
      >
        {event.imageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden mb-4">
            <ImageWithFallback src={event.imageUrl} alt={pick(event.title, locale)} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <span className="text-sm tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
            {dateStr}
          </span>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs border"
            style={{ color, borderColor: color, background: 'transparent', fontWeight: 'var(--font-weight-medium)' }}
          >
            {event.category}
          </span>
        </div>

        <h4 className="text-base mb-2" style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.4 }}>
          {pick(event.title, locale)}
        </h4>
        <MarkdownContent content={pick(event.description, locale)} className="text-sm" />
      </div>

      <div
        className="absolute left-2.5 top-5 md:left-1/2 md:-translate-x-1/2 size-4 rounded-full border-2 border-background z-10 shrink-0"
        style={{ background: color }}
      />
    </div>
  );
}
