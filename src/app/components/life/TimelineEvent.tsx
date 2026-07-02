import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { MarkdownContent } from '../shared/MarkdownContent';
import { ExpandToggleLabel, CollapseFooter } from './ExpandToggle';
import { useI18n, type Locale } from '../../context/i18n';
import { pick } from '../../lib/localized';
import { excerptFromMarkdown } from '../../lib/excerpt';
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
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const color = colorForCategory(event.category);
  const dateStr = formatDate(event.year, event.month, event.day, locale);
  const description = pick(event.description, locale);

  return (
    <div
      className={`group relative flex items-start mb-10 pl-10 md:pl-0 ${
        !open && (side === 'left' ? 'md:flex-row-reverse' : 'md:flex-row')
      }`}
    >
      {/* Collapsed: alternates left/right in a half-width card, matching the timeline spine.
          Expanded: breaks out to full width — a long diary essay is not a comfortable read
          squeezed into a half-width column, so reading mode gets the whole row and a larger type size. */}
      <div
        className={`rounded-xl border border-border bg-card shadow-sm transition-[width,padding,box-shadow] hover:shadow-md ${
          open ? 'w-full p-6 sm:p-8' : `w-full md:w-[calc(50%-2rem)] p-5 ${side === 'left' ? 'md:mr-8' : 'md:ml-8'}`
        }`}
      >
        {/* Toggle button holds only text — no nested links/images, so it stays valid + fully clickable. */}
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="block w-full text-left cursor-pointer">
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

          <h4
            className={open ? 'text-xl sm:text-2xl mb-3' : 'text-base mb-2'}
            style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.4 }}
          >
            {pick(event.title, locale)}
          </h4>

          {!open && (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              {excerptFromMarkdown(description)}
            </p>
          )}

          <ExpandToggleLabel open={open} expandLabel={t.life.expand} collapseLabel={t.life.collapse} className="text-xs mt-3" />
        </button>

        <motion.div
          initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <div className="pt-4 max-w-2xl">
            {event.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden mb-5">
                <ImageWithFallback src={event.imageUrl} alt={pick(event.title, locale)} className="w-full h-full object-cover" />
              </div>
            )}
            <MarkdownContent content={description} className="text-base sm:text-lg" />
            {open && <CollapseFooter collapseLabel={t.life.collapse} onCollapse={() => setOpen(false)} />}
          </div>
        </motion.div>
      </div>

      <div
        className={`absolute left-2.5 top-5 size-4 rounded-full border-2 border-background z-10 shrink-0 ${
          open ? '' : 'md:left-1/2 md:-translate-x-1/2'
        }`}
        style={{ background: color }}
      />
    </div>
  );
}
