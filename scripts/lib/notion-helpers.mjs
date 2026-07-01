// Shared helpers for the Notion → static-data sync scripts
// (fetch-notion-diary.mjs, fetch-notion-posts.mjs, migrate-legacy-posts-to-notion.mjs).

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

/** Best-effort cover image URL from a Notion page's cover (external or uploaded file). */
export function pageCoverUrl(page) {
  if (!page.cover) return undefined;
  if (page.cover.type === "external") return page.cover.external.url;
  if (page.cover.type === "file") return page.cover.file.url;
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
