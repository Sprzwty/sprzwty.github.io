import { Link, useLocation } from 'react-router';
import { PenLine, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { ModeToggle } from './ModeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../../context/i18n';

export function TopNav() {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t.nav.home, to: '/' },
    { label: t.nav.articles, to: '/articles' },
    { label: t.nav.life, to: '/life' },
    { label: t.nav.about, to: '/about' },
    { label: t.nav.contact, to: '/contact' },
  ];

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <PenLine className="size-4 sm:size-5" style={{ color: 'var(--primary)' }} />
          <span
            style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}
            className="text-sm sm:text-base"
          >
            Wang Tongyu
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent"
              style={{
                color: isActive(to) ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: isActive(to) ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right-side controls */}
        <div className="flex items-center gap-1">
          <SearchBar />
          <ModeToggle />
          <div className="hidden sm:flex">
            <LanguageSwitcher />
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <X className="size-5" style={{ color: 'var(--foreground)' }} />
              : <Menu className="size-5" style={{ color: 'var(--foreground)' }} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-md text-sm transition-colors hover:bg-accent"
              style={{
                color: isActive(to) ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: isActive(to) ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
              }}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-1">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
