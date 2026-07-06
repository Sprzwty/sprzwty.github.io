import { Link } from 'react-router';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useI18n } from '../../context/i18n';

const PROFILE_SRC = '/assets/profile.webp';

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="bg-muted py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex flex-col-reverse sm:flex-row items-center sm:items-start gap-8 sm:gap-10">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6 flex-1 min-w-0">
          <Badge variant="secondary">{t.hero.badge}</Badge>
          <h1 className="font-display text-foreground leading-tight text-3xl sm:text-4xl">
            {t.hero.title}
          </h1>
          <p className="max-w-xl text-muted-foreground leading-relaxed">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <Button size="lg" asChild>
              <a href="#featured">{t.hero.ctaFeatured}</a>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link to="/about">{t.hero.ctaAbout}</Link>
            </Button>
          </div>
        </div>

        <div className="shrink-0">
          <img
            src={PROFILE_SRC}
            alt="Wang Tongyu"
            className="size-32 sm:size-40 rounded-full object-cover ring-4 ring-primary/20 shadow-lg"
            width={160}
            height={160}
          />
        </div>
      </div>
    </section>
  );
}
