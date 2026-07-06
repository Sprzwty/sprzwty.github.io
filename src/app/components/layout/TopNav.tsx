import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { ModeToggle } from './ModeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../../context/i18n';
import { cn } from '../ui/utils';

const PROFILE_SRC = '/assets/profile.webp';

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

  const linkClass = (to: string) =>
    cn(
      'px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent',
      isActive(to) ? 'text-foreground font-medium' : 'text-muted-foreground font-normal'
    );

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src={PROFILE_SRC}
            alt=""
            className="size-7 sm:size-8 rounded-full object-cover ring-1 ring-border"
            width={32}
            height={32}
          />
          <span className="text-sm sm:text-base text-foreground font-medium">
            Wang Tongyu
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ label, to }) => (
            <Link key={to} to={to} className={linkClass(to)}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <SearchBar />
          <ModeToggle />
          <div className="hidden sm:flex">
            <LanguageSwitcher />
          </div>
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <X className="size-5 text-foreground" />
              : <Menu className="size-5 text-foreground" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={cn(linkClass(to), 'py-2.5')}
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
