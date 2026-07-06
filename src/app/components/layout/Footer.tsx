import { Link } from 'react-router';
import { Github } from 'lucide-react';
import { Separator } from '../ui/separator';
import { CURRENT_VERSION } from '../../data/changelog';
import { useI18n } from '../../context/i18n';

const PROFILE_SRC = '/assets/profile.webp';

export function Footer() {
  const { t } = useI18n();

  const navLinks = [
    { label: t.nav.home, to: '/' },
    { label: t.nav.articles, to: '/articles' },
    { label: t.nav.life, to: '/life' },
    { label: t.nav.about, to: '/about' },
    { label: t.nav.changelog, to: '/changelog' },
    { label: t.nav.contact, to: '/contact' },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={PROFILE_SRC}
              alt=""
              className="size-6 rounded-full object-cover ring-1 ring-border"
              width={24}
              height={24}
            />
            <span className="text-foreground font-medium">Wang Tongyu</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.footer.tagline}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{t.footer.nowLabel}: </span>
            {t.footer.nowText}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm text-foreground font-medium">
            {t.footer.navigation}
          </span>
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm text-foreground font-medium">
            {t.footer.follow}
          </span>
          <a
            href="https://github.com/sprzwty"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </div>
      </div>

      <Separator />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-sm text-muted-foreground">
        <span>{t.footer.copyright}</span>
        <span className="hidden sm:inline" aria-hidden>·</span>
        <Link to="/changelog" className="font-medium transition-colors hover:text-foreground">
          {t.nav.changelog}
        </Link>
        <Link
          to="/changelog"
          className="inline-flex items-center rounded-full px-2.5 py-0.5 tabular-nums bg-muted font-medium transition-colors hover:text-foreground"
          title={t.changelog.title}
        >
          v{CURRENT_VERSION}
        </Link>
      </div>
    </footer>
  );
}
