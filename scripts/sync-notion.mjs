#!/usr/bin/env node
/**
 * Sync Notion database pages → Jekyll posts in _posts/notion/
 *
 * Requires env:
 *   NOTION_TOKEN          — integration secret (not MCP)
 *   NOTION_DATABASE_ID    — database id from Notion URL
 *
 * Only creates/updates files that carry notion_page_id in front matter.
 * Manual posts elsewhere under _posts/ are never touched.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "notion-sync.config.json"), "utf8")
);

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error(
    "Missing NOTION_TOKEN or NOTION_DATABASE_ID.\n" +
      "See docs/NOTION_SYNC.md for setup."
  );
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });
const postsDir = path.join(ROOT, config.postsDir);

function slugify(text) {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "post";
}

function readProperty(props, name) {
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

function hasProperty(props, name) {
  return Boolean(name && props[name]);
}

function shouldPublish(props) {
  const publishKey = config.properties.publish;
  if (!publishKey || !hasProperty(props, publishKey)) {
    return true;
  }
  return readProperty(props, publishKey) === true;
}

function formatDate(value) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

function formatDateTime(value) {
  const date = formatDate(value);
  return `${date} 12:00:00 ${config.timezone || "+0900"}`;
}

function escapeYaml(value) {
  return String(value).replace(/'/g, "''");
}

function buildFrontMatter(fields) {
  const lines = ["---"];

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${escapeYaml(item)}`);
      }
    } else if (typeof value === "boolean") {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: '${escapeYaml(value)}'`);
    }
  }

  lines.push("---");
  return lines.join("\n");
}

function parseExistingPosts(dir) {
  const map = new Map();

  if (!fs.existsSync(dir)) {
    return map;
  }

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".md")) {
      continue;
    }

    const fullPath = path.join(dir, file);
    const content = fs.readFileSync(fullPath, "utf8");
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
      continue;
    }

    const idMatch = match[1].match(/^notion_page_id:\s*['"]?([^\s'"]+)['"]?\s*$/m);
    if (idMatch) {
      map.set(idMatch[1], fullPath);
    }
  }

  return map;
}

async function fetchAllPages() {
  const pages = [];
  let cursor;

  do {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: cursor,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return pages;
}

async function pageToMarkdown(pageId) {
  const blocks = await n2m.pageToMarkdown(pageId);
  const result = n2m.toMarkdownString(blocks);
  return (result.parent || "").trim();
}

function buildPostPath(date, title, pageId, existingPath) {
  if (existingPath) {
    return existingPath;
  }

  const slug = slugify(title);
  const fileName = `${formatDate(date)}-${slug}.md`;
  return path.join(postsDir, fileName);
}

async function buildPost(page, existingPath) {
  const props = page.properties;
  const title = readProperty(props, config.properties.title) || "Untitled";
  const dateRaw = readProperty(props, config.properties.date);
  const date = formatDate(dateRaw || page.created_time);
  const categories = readProperty(props, config.properties.categories);
  const tags = readProperty(props, config.properties.tags);
  const subtitle = readProperty(props, config.properties.subtitle);
  const pin = readProperty(props, config.properties.pin);

  const frontMatter = {
    ...config.defaults,
    title,
    subtitle,
    date: formatDateTime(dateRaw || page.created_time),
    categories,
    author: config.author,
    tags: Array.isArray(tags) ? tags : tags ? [tags] : categories ? [categories] : undefined,
    notion_page_id: page.id,
    notion_synced_at: new Date().toISOString(),
  };

  if (pin === true) {
    frontMatter.pin = true;
  }

  const body = await pageToMarkdown(page.id);
  const content = `${buildFrontMatter(frontMatter)}\n\n${body}\n`;
  const targetPath = buildPostPath(date, title, page.id, existingPath);
  const hash = crypto.createHash("sha256").update(content).digest("hex");

  return { targetPath, content, hash, pageId: page.id };
}

async function main() {
  fs.mkdirSync(postsDir, { recursive: true });

  const existing = parseExistingPosts(postsDir);
  const pages = await fetchAllPages();
  const seen = new Set();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const page of pages) {
    if (!shouldPublish(page.properties)) {
      skipped += 1;
      continue;
    }

    seen.add(page.id);
    const existingPath = existing.get(page.id);
    const post = await buildPost(page, existingPath);

    if (existingPath && fs.existsSync(existingPath)) {
      const oldContent = fs.readFileSync(existingPath, "utf8");
      const oldHash = crypto.createHash("sha256").update(oldContent).digest("hex");
      if (oldHash === post.hash) {
        skipped += 1;
        continue;
      }
      updated += 1;
    } else {
      created += 1;
    }

    fs.mkdirSync(path.dirname(post.targetPath), { recursive: true });
    fs.writeFileSync(post.targetPath, post.content, "utf8");
    console.log(`synced: ${path.relative(ROOT, post.targetPath)}`);
  }

  console.log(
    `Done. created=${created}, updated=${updated}, skipped=${skipped}, total_in_notion=${pages.length}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
