// Shared helpers for the Notion → static-data sync scripts
// (fetch-notion-diary.mjs, fetch-notion-posts.mjs, migrate-legacy-posts-to-notion.mjs).

import fs from "fs";
import path from "path";
import { NotionToMarkdown } from "notion-to-md";

const NOTION_IMAGES_DIR = "public/notion-images";
const CONTENT_TYPE_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function extensionFromUrl(url) {
  const match = url.split("?")[0].match(/\.(\w{3,4})$/);
  return match ? match[1].toLowerCase() : undefined;
}

/**
 * Downloads a Notion-hosted file (its `file.url` is a signed URL that expires
 * after ~1h) to `public/notion-images/` so it survives past the sync run,
 * and returns a stable local path (e.g. `/notion-images/<key>.jpg`).
 * Permanent "external" images should never be passed here — use the URL as-is.
 *
 * Cached by `key` (a stable id, e.g. a block/page id — NOT the signed URL,
 * which changes every time): re-running the sync skips the download if a
 * file for that key already exists. This means replacing the image *inside*
 * an existing Notion block won't pick up the new file automatically; delete
 * the corresponding file under `public/notion-images/` to force a re-fetch.
 */
export async function rehostNotionFile(url, key, rootDir) {
  const dir = path.join(rootDir, NOTION_IMAGES_DIR);
  fs.mkdirSync(dir, { recursive: true });

  const existing = fs.readdirSync(dir).find((name) => name.startsWith(`${key}.`));
  if (existing) return `/notion-images/${existing}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = (response.headers.get("content-type") || "").split(";")[0].trim();
    const ext = CONTENT_TYPE_EXT[contentType] || extensionFromUrl(url) || "bin";
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(path.join(dir, `${key}.${ext}`), buffer);
    return `/notion-images/${key}.${ext}`;
  } catch (error) {
    console.warn(`  ⚠ failed to rehost image (${key}): ${error.message}. Falling back to the temporary Notion URL.`);
    return url;
  }
}

/**
 * Creates a NotionToMarkdown client that automatically rehosts any directly
 * uploaded ("file"-type) inline image so the exported Markdown never links
 * to an expiring Notion URL. Images embedded via an external link pass
 * through untouched (their URL is already permanent).
 */
export function createNotionToMd(notion, rootDir) {
  const n2m = new NotionToMarkdown({ notionClient: notion });
  n2m.setCustomTransformer("image", async (block) => {
    const image = block.image;
    if (image.type !== "file") return false;
    const caption = image.caption.map((t) => t.plain_text).join("").trim() || "image";
    const localPath = await rehostNotionFile(image.file.url, block.id, rootDir);
    return `![${caption}](${localPath})`;
  });
  return n2m;
}

/** Turn a title into a URL-safe slug (also used for stable-ish ids). */
export function slugify(text) {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "untitled";
}

/** Read a single Notion property value by its column name, regardless of type. */
export function readProperty(props, name) {
  if (!name || !props[name]) {
    return undefined;
  }
  const prop = props[name];

  switch (prop.type) {
    case "title":
      return prop.title.map((t) => t.plain_text).join("");
    case "rich_text":
      return prop.rich_text.map((t) => t.plain_text).join("");
    case "date":
      return prop.date?.start ?? undefined;
    case "select":
      return prop.select?.name ?? undefined;
    case "multi_select":
      return prop.multi_select.map((item) => item.name);
    case "checkbox":
      return prop.checkbox;
    case "number":
      return prop.number;
    case "url":
      return prop.url ?? undefined;
    default:
      return undefined;
  }
}

/** Fetch every page in a database, following pagination cursors. */
export async function fetchAllPages(notion, databaseId) {
  const pages = [];
  let cursor;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return pages;
}

/** Full page body as Markdown (headings, lists, code, images, math — everything notion-to-md supports). */
export async function pageToMarkdown(n2m, pageId) {
  const blocks = await n2m.pageToMarkdown(pageId);
  const result = n2m.toMarkdownString(blocks);
  return (result.parent || "").trim();
}

/** `YYYY-MM-DD`, defaulting to today when the source value is missing. */
export function formatDateOnly(value) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

/**
 * Best-effort cover image URL from a Notion page's cover.
 * External covers are returned as-is (permanent). Uploaded ("file") covers
 * are rehosted into `public/notion-images/` since Notion's URL expires.
 */
export async function pageCoverUrl(page, rootDir) {
  if (!page.cover) return undefined;
  if (page.cover.type === "external") return page.cover.external.url;
  if (page.cover.type === "file") return rehostNotionFile(page.cover.file.url, `cover-${page.id}`, rootDir);
  return undefined;
}

/** Strip Markdown syntax down to plain text, for auto-generated excerpts. */
export function excerptFromMarkdown(markdown, maxLen = 160) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trim()}…`;
}

/** Rough reading-time estimate (~200 words/min for English; ~400 chars/min for CJK). */
export function estimateReadTimeMin(markdown) {
  const cjkChars = (markdown.match(/[\u3000-\u9fff\uf900-\ufaff]/g) || []).length;
  const latinWords = markdown.replace(/[\u3000-\u9fff\uf900-\ufaff]/g, "").split(/\s+/).filter(Boolean).length;
  const minutes = cjkChars / 400 + latinWords / 200;
  return Math.max(1, Math.round(minutes));
}

/** Serialize a value as TypeScript source (used when hand-writing generated .ts data files). */
export function toTs(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${pad}  ${toTs(v, indent + 1)}`).join(",\n");
    return `[\n${items},\n${pad}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    const body = entries.map(([k, v]) => `${pad}  ${k}: ${toTs(v, indent + 1)}`).join(",\n");
    return `{\n${body},\n${pad}}`;
  }
  return JSON.stringify(value);
}
