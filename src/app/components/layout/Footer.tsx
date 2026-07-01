import { Link } from 'react-router';
import { Github, PenLine } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useI18n } from '../../context/i18n';

export function Footer() {
  const { t } = useI18n();

  const navLinks = [
    { label: t.nav.home, to: '/' },
    { label: t.nav.articles, to: '/articles' },
    { label: t.nav.life, to: '/life' },
    { label: t.nav.about, to: '/about' },
    { label: t.nav.contact, to: '/contact' },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <PenLine className="size-4" style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
              Wang Tongyu
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
            {t.footer.tagline}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm" style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
            {t.footer.navigation}
          </span>
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-sm transition-colors hover:text-foreground"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm" style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
            {t.footer.follow}
          </span>
          <a href="https://github.com/sprzwty" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm transition-colors hover:text-foreground" style={{ color: 'var(--muted-foreground)' }}>
            <Github className="size-4" />GitHub
          </a>
        </div>
      </div>

      <Separator />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
        {t.footer.copyright}
      </div>
    </footer>
  );
}
