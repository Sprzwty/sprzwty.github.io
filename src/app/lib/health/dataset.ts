import { decryptJson, type EncryptedPayload } from '../fitness/crypto.ts';
import type { HealthDataset } from './model.ts';

/** Written by scripts/sync-health.mjs; served at BASE_URL + this path. */
export const HEALTH_PUBLIC_PATH = 'fitness/health.enc.json';

export function decryptHealth(payload: EncryptedPayload, password: string): Promise<HealthDataset> {
  return decryptJson<HealthDataset>(payload, password);
}
