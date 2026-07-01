import { createContext, useContext, type ReactNode } from 'react';
import { lifeEvents, type LifeEvent } from '../data/life-events';

export type DiaryEntry = LifeEvent;

interface DiaryContextValue {
  entries: DiaryEntry[];
}

const DiaryContext = createContext<DiaryContextValue | null>(null);

/**
 * Diary is read-only: entries are authored in Notion and pulled in at build
 * time by `scripts/fetch-notion-diary.mjs` into `data/life-events.ts`. There
 * is no in-app editing.
 */
export function DiaryProvider({ children }: { children: ReactNode }) {
  return (
    <DiaryContext.Provider value={{ entries: lifeEvents }}>
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary must be used inside DiaryProvider');
  return ctx;
}
