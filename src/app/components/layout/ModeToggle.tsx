import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { useI18n } from '../../context/i18n';

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Until mounted, theme is unknown — render a stable placeholder to avoid
  // a hydration mismatch / wrong-icon flash.
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label={t.theme.toggle} disabled>
        <Sun className="size-4 opacity-0" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button variant="ghost" size="icon" aria-label={t.theme.toggle} onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
