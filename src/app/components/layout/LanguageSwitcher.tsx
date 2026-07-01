import { useI18n, type Locale } from '../../context/i18n';
import { Button } from '../ui/button';

const locales: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中' },
  { value: 'ja', label: '日' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-0.5">
      {locales.map(({ value, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => setLocale(value)}
          className="px-2 h-8 text-xs rounded-md"
          style={{
            color: locale === value ? 'var(--foreground)' : 'var(--muted-foreground)',
            fontWeight: locale === value ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
            background: locale === value ? 'var(--accent)' : 'transparent',
          }}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
