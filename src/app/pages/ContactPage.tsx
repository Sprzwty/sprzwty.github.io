import { useState } from 'react';
import { Mail, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { useI18n } from '../context/i18n';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function ContactPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  useDocumentTitle(t.nav.contact);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t.contact.invalidEmail);
      return;
    }
    toast.success(t.contact.subscribed);
    setEmail('');
  };

  // TODO: replace with a real contact email once confirmed.
  const CONTACT_EMAIL = 'contact@example.com';

  const rows = [
    { icon: Mail, label: t.contact.email, value: CONTACT_EMAIL },
    { icon: Clock, label: t.contact.responseTime, value: t.contact.responseTimeValue },
    { icon: MessageSquare, label: t.contact.openTo, value: t.contact.openToValue },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-10">
        <h1 style={{ color: 'var(--foreground)' }}>{t.contact.title}</h1>
        <p className="mt-3" style={{ color: 'var(--muted-foreground)', lineHeight: '1.75' }}>
          {t.contact.subtitle}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 py-6 sm:py-8">
          {rows.map(({ icon: Icon, label, value }, i) => (
            <div key={label}>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--muted)' }}>
                  <Icon className="size-5" style={{ color: 'var(--foreground)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>{label}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{value}</p>
                </div>
              </div>
              {i < rows.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
          <Button size="lg" className="w-full" asChild>
            <a href={`mailto:${CONTACT_EMAIL}`}>{t.contact.send}</a>
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="py-6 sm:py-8">
          <h3 style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
            {t.contact.newsletterTitle}
          </h3>
          <p className="text-sm mt-2 mb-4" style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
            {t.contact.newsletterDesc}
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.contact.emailPlaceholder}
              aria-label={t.contact.email}
              className="flex-1"
            />
            <Button type="submit">{t.contact.subscribe}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
