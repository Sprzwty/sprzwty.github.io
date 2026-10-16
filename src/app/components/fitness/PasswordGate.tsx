import { useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';
import { useI18n } from '../../context/i18n';
import { WrongPasswordError, type EncryptedPayload } from '../../lib/fitness/crypto';
import { decryptDataset } from '../../lib/fitness/dataset';
import type { Workout } from '../../lib/fitness/motra';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function PasswordGate({ payload, onUnlock }: { payload: EncryptedPayload; onUnlock: (workouts: Workout[]) => void }) {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      onUnlock((await decryptDataset(payload, password)).workouts);
    } catch (err) {
      setError(err instanceof WrongPasswordError ? t.fitness.wrongPassword : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto flex flex-col gap-4 rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
        <Lock className="size-4" />
        <span className="font-medium">{t.fitness.title}</span>
      </div>
      <p className="text-sm" style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>{t.fitness.lockedDesc}</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fitness-password">{t.fitness.password}</Label>
        <Input
          id="fitness-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm" style={{ color: 'var(--destructive)' }}>{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? t.fitness.unlocking : t.fitness.unlock}</Button>
    </form>
  );
}
