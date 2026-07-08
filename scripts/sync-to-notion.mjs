#!/usr/bin/env node
/**
 * Sync all Markdown under notion-sync/ to the blog Notion database (create or update by Title).
 *
 * Each Markdown file carries Notion metadata in YAML front matter.
 * See notion-sync/README.md and docs/NOTION_SYNC.md.
 *
 * Requires env:
 *   NOTION_TOKEN
 *   NOTION_BLOG_DATABASE_ID
 *
 * Usage:
 *   npm run sync:to-notion
 *   npm run sync:to-notion -- --dry-run
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import { formatDateOnly, mapTitlesToNotionFields } from "./lib/notion-helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SYNC_DIR = path.join(ROOT, "notion-sync");
const DRY_RUN = process.argv.includes("--dry-run");

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

const SKIP_BASENAMES = new Set(["readme.md", "_template.md"]);

if (!DRY_RUN && (!NOTION_TOKEN || !DATABASE_ID)) {
  console.error(
    "Missing NOTION_TOKEN or NOTION_BLOG_DATABASE_ID.\nSee docs/NOTION_SYNC.md for setup, or pass --dry-run."
  );
  process.exit(1);
}

const notion = DRY_RUN ? null : new Client({ auth: NOTION_TOKEN });

function listSyncFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSyncFiles(fullPath));
      continue;
    }
    if (!entry.name.endsWith(".md")) {
      continue;
    }
    if (entry.name.startsWith("_")) {
      continue;
    }
    if (SKIP_BASENAMES.has(entry.name.toLowerCase())) {
      continue;
    }
    files.push(fullPath);
  }

  return files.sort();
}

function toArray(value) {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function parsePost(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const rel = path.relative(SYNC_DIR, filePath).replace(/\\/g, "/");

  if (data.sync === false) {
    return { rel, skip: true, reason: "sync: false" };
  }

  const titles = mapTitlesToNotionFields(data);
  if (!titles) {
    return { rel, skip: true, reason: "missing title_zh or title in front matter" };
  }

  return {
    rel,
    skip: false,
    meta: {
      title: titles.title,
      titleZh: titles.titleZh,
      titleJa: titles.titleJa,
      matchTitles: titles.matchTitles,
      date: formatDateOnly(
        data.date instanceof Date ? data.date.toISOString() : data.date
      ),
      category: data.category ? String(data.category) : "Uncategorized",
      tags: toArray(data.tags).map(String),
      subtitle: data.subtitle ? String(data.subtitle) : undefined,
      subtitleZh: data.subtitle_zh ? String(data.subtitle_zh) : undefined,
      subtitleJa: data.subtitle_ja ? String(data.subtitle_ja) : undefined,
      pin: data.pin === true,
      publish: data.publish !== false,
    },
    body: content.trim(),
  };
}

function wikilinksToMarkdown(text) {
  return text.replace(/\[\[([^\]]+)\]\]/g, "[$1]");
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function buildProperties(meta) {
  const {
    title,
    titleZh,
    titleJa,
    date,
    category,
    tags,
    subtitle,
    subtitleZh,
    subtitleJa,
    pin,
    publish,
  } = meta;

  const properties = {
    [PROPERTIES.title]: { title: [{ text: { content: title } }] },
    [PROPERTIES.publish]: { checkbox: publish },
    [PROPERTIES.pin]: { checkbox: pin === true },
  };

  if (titleZh) {
    properties[PROPERTIES.titleZh] = { rich_text: [{ text: { content: titleZh } }] };
  }
  if (titleJa) {
    properties[PROPERTIES.titleJa] = { rich_text: [{ text: { content: titleJa } }] };
  }
  if (date) {
    properties[PROPERTIES.date] = { date: { start: date } };
  }
  if (category) {
    properties[PROPERTIES.category] = { select: { name: category } };
  }
  if (tags.length > 0) {
    properties[PROPERTIES.tags] = { multi_select: tags.map((name) => ({ name })) };
  }
  if (subtitle) {
    properties[PROPERTIES.subtitle] = {
      rich_text: [{ text: { content: subtitle.slice(0, 2000) } }],
    };
  }
  if (subtitleZh) {
    properties[PROPERTIES.subtitleZh] = {
      rich_text: [{ text: { content: subtitleZh.slice(0, 2000) } }],
    };
  }
  if (subtitleJa) {
    properties[PROPERTIES.subtitleJa] = {
      rich_text: [{ text: { content: subtitleJa.slice(0, 2000) } }],
    };
  }

  return properties;
}

async function findPageForPost(matchTitles) {
  for (const candidate of matchTitles) {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: { property: PROPERTIES.title, title: { equals: candidate } },
    });
    if (response.results[0]) {
      return response.results[0];
    }
  }
  return null;
}

async function listAllBlockIds(blockId) {
  const ids = [];
  let cursor;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    });
    ids.push(...response.results.map((block) => block.id));
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return ids;
}

async function replacePageContent(pageId, blocks) {
  const existingIds = await listAllBlockIds(pageId);

  for (const blockId of existingIds) {
    await notion.blocks.update({ block_id: blockId, archived: true });
  }

  for (const blockChunk of chunk(blocks, 100)) {
    await notion.blocks.children.append({ block_id: pageId, children: blockChunk });
  }
}

async function createPage(meta, blocks) {
  const [firstChunk, ...restChunks] = chunk(blocks, 100);

  const page = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: buildProperties(meta),
    children: firstChunk ?? [],
  });

  for (const restChunk of restChunks) {
    await notion.blocks.children.append({ block_id: page.id, children: restChunk });
  }

  return page;
}

async function updatePage(pageId, meta, blocks) {
  await notion.pages.update({
    page_id: pageId,
    properties: buildProperties(meta),
  });
  await replacePageContent(pageId, blocks);
}

async function syncFile(filePath) {
  const parsed = parsePost(filePath);

  if (parsed.skip) {
    console.log(`\n${parsed.rel}`);
    console.log(`  skipped (${parsed.reason})`);
    return "skipped";
  }

  const { meta, body, rel } = parsed;
  const markdown = wikilinksToMarkdown(body);
  const blocks = markdownToBlocks(markdown, { notionLimits: { truncate: true } });

  console.log(`\n${rel}`);
  console.log(`  notion title: ${meta.title}`);
  console.log(`  title (EN): ${meta.titleZh ?? "(none)"}`);
  console.log(`  title (JA): ${meta.titleJa ?? "(none)"}`);
  console.log(`  category: ${meta.category} | tags: ${meta.tags.join(", ") || "(none)"}`);
  console.log(`  publish: ${meta.publish} | pin: ${meta.pin}`);
  console.log(`  blocks: ${blocks.length}`);

  if (DRY_RUN) {
    return "dry-run";
  }

  const existing = await findPageForPost(meta.matchTitles);
  if (existing) {
    await updatePage(existing.id, meta, blocks);
    console.log(`  updated ✓  id=${existing.id}`);
    return "updated";
  }

  const page = await createPage(meta, blocks);
  console.log(`  created ✓  id=${page.id}`);
  return "created";
}

async function main() {
  const files = listSyncFiles(SYNC_DIR);
  console.log(`notion-sync → Notion blog (${files.length} file(s))${DRY_RUN ? " [dry run]" : ""}`);

  if (files.length === 0) {
    console.log(`No Markdown files under ${path.relative(ROOT, SYNC_DIR)}/`);
    return;
  }

  const counts = { created: 0, updated: 0, skipped: 0 };

  for (const filePath of files) {
    const result = await syncFile(filePath);
    if (result in counts) {
      counts[result] += 1;
    }
  }

  console.log(
    `\nDone.${DRY_RUN ? " (dry run — nothing written)" : ` created=${counts.created}, updated=${counts.updated}, skipped=${counts.skipped}`}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
