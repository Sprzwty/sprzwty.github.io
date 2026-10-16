import { decryptJson, type EncryptedPayload } from './crypto.ts';
import { parseMotraRows, type Workout } from './motra.ts';
import { readFirstSheet } from './xlsx.ts';

export interface FitnessDataset {
  version: 1;
  updatedAt: string;
  workouts: Workout[];
}

/** Written by scripts/sync-fitness.mjs; served at BASE_URL + this path. */
const DATA_PUBLIC_PATH = 'fitness/data.enc.json';

/** Returns null when no dataset has been published yet. */
export async function fetchEncryptedDataset(): Promise<EncryptedPayload | null> {
  const res = await fetch(`${import.meta.env.BASE_URL}${DATA_PUBLIC_PATH}`, { cache: 'no-cache' });
  if (!res.ok) return null;
  try {
    // The Vite dev server answers unknown paths with index.html (200), so a parse failure also means "absent".
    return (await res.json()) as EncryptedPayload;
  } catch {
    return null;
  }
}

export function decryptDataset(payload: EncryptedPayload, password: string): Promise<FitnessDataset> {
  return decryptJson<FitnessDataset>(payload, password);
}

export async function readWorkoutsFromXlsx(file: File): Promise<Workout[]> {
  return parseMotraRows(await readFirstSheet(await file.arrayBuffer()));
}
