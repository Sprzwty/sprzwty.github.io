import { pick } from '../../lib/localized';
import { useI18n } from '../../context/i18n';
import type { ChangelogChange, ChangelogRelease } from '../../data/changelog';
import { cn } from '../ui/utils';

const TYPE_DOT_CLASS: Record<ChangelogChange['type'], string> = {
  added: 'bg-chart-2',
  changed: 'bg-chart-4',
  fixed: 'bg-chart-1',
  removed: 'bg-chart-5',
};

const TYPE_LABEL_CLASS: Record<ChangelogChange['type'], string> = {
  added: 'text-chart-2',
  changed: 'text-chart-4',
  fixed: 'text-chart-1',
  removed: 'text-chart-5',
};

interface ChangelogReleaseCardProps {
  release: ChangelogRelease;
  isLatest?: boolean;
}

function formatDate(date: string, locale: 'en' | 'zh' | 'ja') {
  const d = new Date(`${date}T00:00:00`);
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  if (locale === 'zh') return d.toLocaleDateString('zh-CN', opts);
  if (locale === 'ja') return d.toLocaleDateString('ja-JP', opts);
  return d.toLocaleDateString('en-US', opts);
}

export function ChangelogReleaseCard({ release, isLatest }: ChangelogReleaseCardProps) {
  const { locale, t } = useI18n();

  const grouped = release.changes.reduce<Record<ChangelogChange['type'], ChangelogChange[]>>(
    (acc, change) => {
      (acc[change.type] ??= []).push(change);
      return acc;
    },
    {} as Record<ChangelogChange['type'], ChangelogChange[]>
  );

  const typeOrder: ChangelogChange['type'][] = ['added', 'changed', 'fixed', 'removed'];

  return (
    <article
      className={cn(
        'rounded-xl border border-border bg-card shadow-sm p-5 sm:p-6',
        isLatest && 'ring-1 ring-primary shadow-md'
      )}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-sm tabular-nums font-medium',
            isLatest ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background'
          )}
        >
          v{release.version}
        </span>
        {isLatest && (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs border border-brand-accent text-brand-accent font-medium">
            {t.changelog.latest}
          </span>
        )}
        <time className="text-sm tabular-nums text-muted-foreground" dateTime={release.date}>
          {formatDate(release.date, locale)}
        </time>
      </div>

      <h2 className="text-lg sm:text-xl mb-2 text-foreground font-medium leading-snug">
        {pick(release.title, locale)}
      </h2>

      {release.summary && (
        <p className="text-sm mb-4 text-muted-foreground leading-relaxed">
          {pick(release.summary, locale)}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {typeOrder.map((type) => {
          const items = grouped[type];
          if (!items?.length) return null;
          return (
            <div key={type}>
              <h3
                className={cn(
                  'text-xs uppercase tracking-wider mb-2 font-medium',
                  TYPE_LABEL_CLASS[type]
                )}
              >
                {t.changelog.changeTypes[type]}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {items.map((change, idx) => (
                  <li
                    key={idx}
                    className="text-sm pl-4 relative text-foreground leading-relaxed"
                  >
                    <span
                      className={cn(
                        'absolute left-0 top-[0.55em] size-1.5 rounded-full',
                        TYPE_DOT_CLASS[type]
                      )}
                    />
                    {pick(change.text, locale)}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </article>
  );
}
