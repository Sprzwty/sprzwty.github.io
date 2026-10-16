import { useI18n } from '../../context/i18n';
import { HR_ZONE_COLORS, formatDuration } from './theme';

/** Proportional 5-segment strip of time spent in each heart-rate zone. */
export function HrBar({ zonesSec, className = 'h-1.5' }: { zonesSec: number[]; className?: string }) {
  const { t } = useI18n();
  const total = zonesSec.reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div className={`flex w-full overflow-hidden rounded-full ${className}`}>
      {zonesSec.map((s, i) =>
        s > 0 ? (
          <div
            key={i}
            style={{ width: `${(s / total) * 100}%`, background: HR_ZONE_COLORS[i] }}
            title={`${t.fitness.zone(i + 1)} · ${formatDuration(s)}`}
          />
        ) : null,
      )}
    </div>
  );
}
