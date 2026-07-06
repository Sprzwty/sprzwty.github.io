import { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { ChangelogTimeline } from '../components/changelog/ChangelogTimeline';
import { changelogReleases, CURRENT_VERSION } from '../data/changelog';
import { useI18n } from '../context/i18n';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function ChangelogPage() {
  const { t } = useI18n();
  useDocumentTitle(t.changelog.title);

  const sorted = useMemo(
    () =>
      [...changelogReleases].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    []
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-10 sm:mb-14">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="size-5" style={{ color: 'var(--primary)' }} />
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs tabular-nums"
            style={{
              background: 'var(--muted)',
              color: 'var(--muted-foreground)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            v{CURRENT_VERSION}
          </span>
        </div>
        <h1 style={{ color: 'var(--foreground)' }}>{t.changelog.title}</h1>
        <p className="mt-2" style={{ color: 'var(--muted-foreground)', lineHeight: '1.75' }}>
          {t.changelog.subtitle}
        </p>
      </div>

      <ChangelogTimeline releases={sorted} />
    </div>
  );
}
