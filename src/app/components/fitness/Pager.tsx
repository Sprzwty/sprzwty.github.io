import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../context/i18n';
import { Button } from '../ui/button';

/** Neighbours shown on each side of the current page before collapsing into "…". */
const SIBLINGS = 1;

function pageItems(page: number, count: number): (number | 'gap')[] {
  const items: (number | 'gap')[] = [];
  for (let p = 1; p <= count; p++) {
    if (p === 1 || p === count || Math.abs(p - page) <= SIBLINGS) items.push(p);
    else if (items[items.length - 1] !== 'gap') items.push('gap');
  }
  return items;
}

export function Pager({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  const { t } = useI18n();
  if (pageCount <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1 flex-wrap">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label={t.fitness.pager.prev}>
        <ChevronLeft className="size-4" />
      </Button>
      {pageItems(page, pageCount).map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>…</span>
        ) : (
          <Button
            key={item}
            variant={item === page ? 'secondary' : 'ghost'}
            size="sm"
            className="min-w-8 tabular-nums"
            onClick={() => onChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button variant="ghost" size="sm" disabled={page >= pageCount} onClick={() => onChange(page + 1)} aria-label={t.fitness.pager.next}>
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
