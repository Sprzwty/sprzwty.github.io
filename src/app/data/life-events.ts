// Seed content — overwritten by `npm run sync:diary` (scripts/fetch-notion-diary.mjs)
// once the diary Notion database syncs. Kept here so `npm run dev` has something
// to render before the first sync.
import type { LocalizedText } from '../lib/localized';

/** Free-form — comes from whatever value you use in the Notion "Category" select. */
export type LifeCategory = string;

export interface LifeEvent {
  id: string;
  year: number;
  month: number;
  day: number;
  title: LocalizedText;
  /** Markdown source (from Notion, via notion-to-md). Rendered with <MarkdownContent>. */
  description: LocalizedText;
  category: LifeCategory;
  imageUrl?: string;
}

export const lifeEvents: LifeEvent[] = [
  {
    id: 'seed-1',
    year: 2026, month: 7, day: 1,
    title: { en: 'Diary synced from Notion' },
    description: {
      en: 'This page now reads directly from the diary Notion database. Once synced, your real entries will replace this placeholder.',
    },
    category: 'Diary',
  },
];
