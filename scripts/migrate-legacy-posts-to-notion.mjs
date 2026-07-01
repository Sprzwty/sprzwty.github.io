#!/usr/bin/env node
/**
 * One-off migration: import the 8 hand-written posts under `_posts/*.md`
 * into the blog Notion database, so Notion becomes the single source of
 * truth for blog content going forward.
 *
 * Requires env:
 *   NOTION_TOKEN              — integration secret
 *   NOTION_BLOG_DATABASE_ID   — blog database id
 *
 * Safe to re-run: skips any post whose title already exists as a page in
 * the database (matched via the Title property).
 *
 * Usage:
 *   npm run migrate:legacy
 *   npm run migrate:legacy -- --dry-run   (parse + report, write nothing)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "_posts");
const DRY_RUN = process.argv.includes("--dry-run");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID;

const PROPERTIES = {
  title: "Title",
  date: "Date",
  category: "Category",
  tags: "Tags",
  subtitle: "Subtitle",
  pin: "Pin",
  publish: "Publish",
};

// Flagged for manual review after migration — large/irregular structure (see plan).
const NEEDS_REVIEW = new Set(["2023-06-21-ConferenceRanking.md"]);

if (!DRY_RUN && (!NOTION_TOKEN || !DATABASE_ID)) {
  console.error(
    "Missing NOTION_TOKEN or NOTION_BLOG_DATABASE_ID.\nSee docs/NOTION_SYNC.md for setup, or pass --dry-run to only parse."
  );
  process.exit(1);
}

const notion = DRY_RUN ? null : new Client({ auth: NOTION_TOKEN });

function listLegacyPostFiles() {
  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
}

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

async function titleAlreadyMigrated(title) {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: { property: PROPERTIES.title, title: { equals: title } },
  });
  return response.results.length > 0;
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function createPage(frontMatter, blocks) {
  const { title, date, category, tags, subtitle, pin, cover } = frontMatter;

  const properties = {
    [PROPERTIES.title]: { title: [{ text: { content: title } }] },
    [PROPERTIES.publish]: { checkbox: true },
  };
  if (date) properties[PROPERTIES.date] = { date: { start: date } };
  if (category) properties[PROPERTIES.category] = { select: { name: category } };
  if (tags.length > 0) properties[PROPERTIES.tags] = { multi_select: tags.map((name) => ({ name })) };
  if (subtitle) properties[PROPERTIES.subtitle] = { rich_text: [{ text: { content: subtitle } }] };
  if (pin) properties[PROPERTIES.pin] = { checkbox: true };

  const [firstChunk, ...restChunks] = chunk(blocks, 100);

  const page = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties,
    cover: cover ? { type: "external", external: { url: cover } } : undefined,
    children: firstChunk ?? [],
  });

  for (const restChunk of restChunks) {
    await notion.blocks.children.append({ block_id: page.id, children: restChunk });
  }

  return page;
}

async function main() {
  const files = listLegacyPostFiles();
  console.log(`Found ${files.length} legacy post(s) under _posts/.`);

  let migrated = 0;
  let skipped = 0;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const title = data.title ? String(data.title) : path.basename(file, ".md");
    const date = data.date ? new Date(data.date).toISOString().slice(0, 10) : undefined;
    const category = Array.isArray(data.categories) ? data.categories[0] : data.categories;
    const tags = toArray(data.tags);
    const subtitle = data.subtitle;
    const pin = data.pin === true;
    const cover = data.cover;

    const blocks = markdownToBlocks(content, { notionLimits: { truncate: true } });

    console.log(`\n${file}`);
    console.log(`  title: ${title}`);
    console.log(`  date: ${date ?? "(none)"} | category: ${category ?? "(none)"} | tags: ${tags.join(", ") || "(none)"} | pin: ${pin}`);
    console.log(`  blocks: ${blocks.length}`);
    if (NEEDS_REVIEW.has(file)) {
      console.log("  ⚠ flagged for manual review in Notion after migration (large/irregular content)");
    }

    if (DRY_RUN) {
      continue;
    }

    if (await titleAlreadyMigrated(title)) {
      console.log("  skipped (already migrated)");
      skipped += 1;
      continue;
    }

    await createPage({ title, date, category, tags, subtitle, pin, cover }, blocks);
    console.log("  migrated ✓");
    migrated += 1;
  }

  console.log(`\nDone.${DRY_RUN ? " (dry run — nothing written)" : ` migrated=${migrated}, skipped=${skipped}`}`);
  if (!DRY_RUN && migrated > 0) {
    console.log(
      "\nNext: review the flagged page(s) in Notion, then delete the migrated files from _posts/ once verified."
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
