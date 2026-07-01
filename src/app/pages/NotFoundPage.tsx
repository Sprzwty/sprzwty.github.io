import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { useI18n } from '../context/i18n';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function NotFoundPage() {
  const { t } = useI18n();
  useDocumentTitle(t.notFound.title);
  return (
    <div className="flex flex-col items-center justify-center py-24 sm:py-32 px-6 text-center gap-6">
      <p className="text-8xl" style={{ color: 'var(--muted-foreground)', fontWeight: 'var(--font-weight-medium)' }}>
        404
      </p>
      <h1 style={{ color: 'var(--foreground)' }}>{t.notFound.title}</h1>
      <p style={{ color: 'var(--muted-foreground)' }}>{t.notFound.desc}</p>
      <Button asChild>
        <Link to="/">{t.notFound.goHome}</Link>
      </Button>
    </div>
  );
}
