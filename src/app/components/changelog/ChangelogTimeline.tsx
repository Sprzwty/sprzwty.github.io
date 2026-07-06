import { ChangelogReleaseCard } from './ChangelogReleaseCard';
import type { ChangelogRelease } from '../../data/changelog';
import { cn } from '../ui/utils';

interface ChangelogTimelineProps {
  releases: ChangelogRelease[];
}

export function ChangelogTimeline({ releases }: ChangelogTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-px bg-border" />

      <ol className="flex flex-col gap-8 sm:gap-10">
        {releases.map((release, idx) => (
          <li key={release.version} className="relative pl-8 sm:pl-10">
            <div
              className={cn(
                'absolute left-0 top-6 size-4 rounded-full border-2 border-background z-10',
                idx === 0 ? 'bg-[var(--brand-accent)]' : 'bg-foreground'
              )}
            />
            <ChangelogReleaseCard release={release} isLatest={idx === 0} />
          </li>
        ))}
      </ol>
    </div>
  );
}
