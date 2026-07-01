import { useMemo, useState } from 'react';
import { Sparkles, List } from 'lucide-react';
import { ImpactView } from '../components/life/ImpactView';
import { Timeline } from '../components/life/Timeline';
import { useI18n } from '../context/i18n';
import { useDiary } from '../context/diary';
import { useDocumentTitle } from '../lib/useDocumentTitle';

type ViewMode = 'impact' | 'normal';

const VIEW_STORAGE_KEY = 'life-view';

function getInitialView(): ViewMode {
  if (typeof window === 'undefined') return 'impact';
  return window.localStorage.getItem(VIEW_STORAGE_KEY) === 'normal' ? 'normal' : 'impact';
}

export function LifePage() {
  const { t } = useI18n();
  const { entries } = useDiary();
  const [view, setViewState] = useState<ViewMode>(getInitialView);

  useDocumentTitle(t.life.title);

  const setView = (v: ViewMode) => {
    setViewState(v);
    if (typeof window !== 'undefined') window.localStorage.setItem(VIEW_STORAGE_KEY, v);
  };

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          new Date(b.year, b.month - 1, b.day).getTime() -
          new Date(a.year, a.month - 1, a.day).getTime()
      ),
    [entries]
  );

  const btnStyle = (active: boolean) => ({
    background: active ? 'var(--background)' : 'transparent',
    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
    fontWeight: active ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex items-end justify-between gap-4 mb-10 sm:mb-14 flex-wrap">
        <div>
          <h1 style={{ color: 'var(--foreground)' }}>{t.life.title}</h1>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)', lineHeight: '1.75' }}>
            {t.life.subtitle}
          </p>
        </div>

        <div className="flex items-center rounded-lg p-1 gap-1 shrink-0" style={{ background: 'var(--muted)' }}>
          <button onClick={() => setView('impact')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all" style={btnStyle(view === 'impact')}>
            <Sparkles className="size-3.5" />
            {t.life.views.impact}
          </button>
          <button onClick={() => setView('normal')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all" style={btnStyle(view === 'normal')}>
            <List className="size-3.5" />
            {t.life.views.normal}
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-24" style={{ color: 'var(--muted-foreground)' }}>
          <p>{t.diary.empty}</p>
        </div>
      ) : view === 'impact' ? (
        <ImpactView events={sorted} />
      ) : (
        <Timeline events={sorted} />
      )}
    </div>
  );
}
