import { Link } from 'react-router';
import { Brain, Code2, Coffee, type LucideIcon } from 'lucide-react';
import { useI18n } from '../../context/i18n';

type LaneKey = 'research' | 'engineering' | 'life';

const LANES: { key: LaneKey; icon: LucideIcon; to: string }[] = [
  { key: 'research', icon: Brain, to: '/articles' },
  { key: 'engineering', icon: Code2, to: '/articles' },
  { key: 'life', icon: Coffee, to: '/life' },
];

export function ContentLaneCards() {
  const { t } = useI18n();

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {LANES.map(({ key, icon: Icon, to }) => (
          <Link
            key={key}
            to={to}
            className="group rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-primary/30 hover:bg-accent"
          >
            <Icon className="size-6 text-primary mb-3" aria-hidden />
            <h3 className="font-medium text-foreground mb-1.5">{t.home.lanes[key].title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.home.lanes[key].description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
