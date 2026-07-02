#!/usr/bin/env node
/**
 * Sync the blog Notion database → src/app/data/posts.ts.
 *
 * Requires env:
 *   NOTION_TOKEN              — integration secret
 *   NOTION_BLOG_DATABASE_ID   — blog database id
 *
 * Notion properties (simplified — see docs/NOTION_SYNC.md):
 *   Title (title, required), Date (date, optional — defaults to created time),
 *   Category (select, optional — defaults to "Uncategorized"), Tags (multi_select, optional),
 *   Subtitle (rich_text, optional — used as excerpt if set), Pin (checkbox, optional — maps to `featured`),
 *   Publish (checkbox, optional — unchecked pages are skipped; missing property = always published).
 *   Title (ZH) / Title (JA), Subtitle (ZH) / Subtitle (JA) (rich_text, optional) — non-English
 *   title/excerpt overrides; fall back to the English value when left blank.
 *
 * Slug, excerpt, cover image, and read time are all auto-derived when not explicitly set,
 * so writing a new post only ever requires a Title and a body. To provide the body in more
 * than one language, tag sections with their own paragraph reading exactly `---LANG:EN---` /
 * `---LANG:ZH---` / `---LANG:JA---` — see docs/NOTION_SYNC.md. Untagged posts are treated as a
 * single language and shown regardless of site locale (unchanged legacy behavior).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "@notionhq/client";
import {
  readProperty,
  fetchAllPages,
  pageToMarkdown,
  formatDateOnly,
  pageCoverUrl,
  slugify,
  excerptFromMarkdown,
  estimateReadTimeMin,
  toTs,
  createNotionToMd,
  splitLocalizedMarkdown,
  buildLocalizedText,
} from "./lib/notion-helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "src/app/data/posts.ts");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID;

const PROPERTIES = {
  title: "Title",
  titleZh: "Title (ZH)",
  titleJa: "Title (JA)",
  date: "Date",
  category: "Category",
  tags: "Tags",
  subtitle: "Subtitle",
  subtitleZh: "Subtitle (ZH)",
  subtitleJa: "Subtitle (JA)",
  pin: "Pin",
  publish: "Publish",
};

const AUTHOR = {
  name: "Wang Tongyu",
  avatarUrl: "/assets/profile.webp",
  initials: "WT",
  bio: {
    en: "JAIST master's student researching trustworthy AI and knowledge representation.",
    zh: "JAIST 硕士研究生，研究方向为可信赖人工智能与知识表示。",
    ja: "JAIST の修士課程学生。信頼できる AI と知識表現を研究。",
  },
};

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800";

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error(
    "Missing NOTION_TOKEN or NOTION_BLOG_DATABASE_ID.\nSee docs/NOTION_SYNC.md for setup."
  );
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });
const n2m = createNotionToMd(notion, ROOT);

function shouldPublish(props) {
  if (!props[PROPERTIES.publish]) return true;
  return readProperty(props, PROPERTIES.publish) === true;
}

/** Per-language excerpt: an explicit Subtitle override wins, otherwise auto-derived from that language's body section. */
function buildLocalizedExcerpt(body, subtitleEn, subtitleZh, subtitleJa) {
  const excerpt = {};
  if (subtitleEn) excerpt.en = subtitleEn;
  else if (body.en) excerpt.en = excerptFromMarkdown(body.en);
  if (subtitleZh) excerpt.zh = subtitleZh;
  else if (body.zh) excerpt.zh = excerptFromMarkdown(body.zh);
  if (subtitleJa) excerpt.ja = subtitleJa;
  else if (body.ja) excerpt.ja = excerptFromMarkdown(body.ja);
  if (!excerpt.en) excerpt.en = "";
  return excerpt;
}

async function buildPost(page) {
  const props = page.properties;
  const title = readProperty(props, PROPERTIES.title) || "Untitled";
  const titleZh = readProperty(props, PROPERTIES.titleZh);
  const titleJa = readProperty(props, PROPERTIES.titleJa);
  const dateRaw = readProperty(props, PROPERTIES.date) || page.created_time;
  const category = readProperty(props, PROPERTIES.category) || "Uncategorized";
  const subtitle = readProperty(props, PROPERTIES.subtitle);
  const subtitleZh = readProperty(props, PROPERTIES.subtitleZh);
  const subtitleJa = readProperty(props, PROPERTIES.subtitleJa);
  const pin = readProperty(props, PROPERTIES.pin) === true;
  const rawBody = (await pageToMarkdown(n2m, page.id)) || "";
  const body = splitLocalizedMarkdown(rawBody);
  const cover = await pageCoverUrl(page, ROOT);

  return {
    id: `notion-${page.id}`,
    slug: slugify(title),
    title: buildLocalizedText(title, titleZh, titleJa),
    excerpt: buildLocalizedExcerpt(body, subtitle, subtitleZh, subtitleJa),
    body,
    category,
    thumbnailUrl: cover || FALLBACK_THUMBNAIL,
    author: AUTHOR,
    publishedAt: formatDateOnly(dateRaw),
    readTimeMin: estimateReadTimeMin(body.en || body.zh || body.ja || ""),
    featured: pin,
  };
}

async function main() {
  const pages = await fetchAllPages(notion, DATABASE_ID);
  const published = pages.filter((page) => shouldPublish(page.properties));
  const posts = await Promise.all(published.map(buildPost));

  posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const header = `// AUTO-GENERATED by scripts/fetch-notion-posts.mjs — do not edit by hand.
// Source of truth: the blog Notion database. Run \`npm run sync:posts\` to refresh.
import type { LocalizedText } from '../lib/localized';

/** Free-form — comes from whatever value you use in the Notion "Category" select. */
export type Category = string;

export interface Author {
  name: string;
  avatarUrl: string;
  initials: string;
  bio: LocalizedText;
}

export interface Post {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  /** Markdown source (from Notion, via notion-to-md). Rendered with <MarkdownContent>. */
  body: LocalizedText;
  category: Category;
  thumbnailUrl: string;
  author: Author;
  publishedAt: string;
  readTimeMin: number;
  featured: boolean;
}
`;

  const body = `export const posts: Post[] = ${toTs(posts)};

export const featuredPost = posts.find((p) => p.featured) ?? posts[0];
export const recentPosts = posts.filter((p) => p !== featuredPost);
`;

  fs.writeFileSync(OUTPUT_PATH, `${header}\n${body}`, "utf8");
  console.log(`Wrote ${posts.length} posts to ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
