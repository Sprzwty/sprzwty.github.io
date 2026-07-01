import { Badge } from '../ui/badge';
import { useI18n } from '../../context/i18n';

export function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="bg-muted py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-5 sm:gap-6">
        <Badge variant="secondary">{t.hero.badge}</Badge>
        <h1 style={{ color: 'var(--foreground)', lineHeight: '1.2' }}>{t.hero.title}</h1>
        <p
          className="max-w-xl"
          style={{ color: 'var(--muted-foreground)', lineHeight: '1.75' }}
        >
          {t.hero.subtitle}
        </p>
      </div>
    </section>
  );
}
