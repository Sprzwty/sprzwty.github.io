#!/usr/bin/env node
/**
 * Notion "Health Checkups" → encrypted public/fitness/health.enc.json.
 *
 * Notion is the source of truth: every run rebuilds the whole dataset from the database and only rewrites the
 * file when the content changed (the ciphertext differs on every encryption, so an unconditional write would
 * commit noise each run). Report PDFs stay in Notion and are never published.
 *
 * Requires env: NOTION_TOKEN, NOTION_HEALTH_DATABASE_ID, FITNESS_PASSWORD
 * Needs Node ≥ 22.18 (imports the site's TypeScript modules via built-in type stripping).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "@notionhq/client";
import { withNotionRetry, readProperty, fetchAllPages } from "./lib/notion-helpers.mjs";
import { HEALTH_PROPS, RESULT_COLUMNS } from "./lib/health-notion-schema.mjs";
import { encryptJson, decryptJson } from "../src/app/lib/fitness/crypto.ts";
import { HEALTH_ITEMS } from "../src/app/lib/health/catalog.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "public/fitness/health.enc.json");

const { NOTION_TOKEN, NOTION_HEALTH_DATABASE_ID: HEALTH_DB, FITNESS_PASSWORD } = process.env;

if (!NOTION_TOKEN || !HEALTH_DB || !FITNESS_PASSWORD) {
  console.error("Missing NOTION_TOKEN, NOTION_HEALTH_DATABASE_ID or FITNESS_PASSWORD.\nSee docs/NOTION_SYNC.md.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function listChildren(blockId) {
  const blocks = [];
  let cursor;
  do {
    const res = await withNotionRetry(
      () => notion.blocks.children.list({ block_id: blockId, start_cursor: cursor }),
      { label: "blocks.children.list" }
    );
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

const cellText = (cell) => cell.map((t) => t.plain_text).join("").trim();

/** Reads every table in the page body whose header row has at least a Value column and a Key or Item column. */
async function readResults(page, label) {
  const results = [];
  const tables = (await listChildren(page.id)).filter((b) => b.type === "table");
  for (const table of tables) {
    const [header = [], ...rows] = (await listChildren(table.id)).map((r) => r.table_row.cells.map(cellText));
    const col = Object.fromEntries(
      RESULT_COLUMNS.map((name) => [name, header.findIndex((h) => h.toLowerCase() === name.toLowerCase())])
    );
    if (col.Value < 0 || (col.Key < 0 && col.Item < 0)) {
      console.warn(`  ⚠ ${label}: skipped a table without ${RESULT_COLUMNS.join(" | ")} header`);
      continue;
    }
    const get = (cells, name) => (col[name] >= 0 ? cells[col[name]] ?? "" : "");
    for (const cells of rows) {
      const item = get(cells, "Item");
      const key = get(cells, "Key") || item;
      const value = get(cells, "Value");
      if (!key || !value) continue;
      results.push({ key, item: item || key, value, unit: get(cells, "Unit"), range: get(cells, "Range"), flag: get(cells, "Flag") });
    }
  }
  return results;
}

async function loadReports() {
  const reports = [];
  for (const page of await fetchAllPages(notion, HEALTH_DB)) {
    const title = readProperty(page.properties, HEALTH_PROPS.name) || "";
    const date = (readProperty(page.properties, HEALTH_PROPS.date) || "").slice(0, 10);
    const label = `${date || "?"} ${title}`;
    if (!date) {
      console.warn(`  ⚠ ${label}: no Date, skipped`);
      continue;
    }
    const results = await readResults(page, label);
    const unknown = [...new Set(results.map((r) => r.key).filter((k) => !HEALTH_ITEMS[k]))];
    console.log(`  ${label}: ${results.length} results`);
    if (unknown.length > 0) console.log(`    not in catalog (shown under "Other"): ${unknown.join(", ")}`);
    reports.push({
      id: page.id,
      date,
      title,
      facility: readProperty(page.properties, HEALTH_PROPS.facility) || "",
      summary: readProperty(page.properties, HEALTH_PROPS.summary) || "",
      url: page.url,
      results,
    });
  }
  return reports.sort((a, b) => a.date.localeCompare(b.date));
}

async function loadExistingReports() {
  if (!fs.existsSync(DATA_PATH)) return null;
  try {
    return (await decryptJson(JSON.parse(fs.readFileSync(DATA_PATH, "utf8")), FITNESS_PASSWORD)).reports;
  } catch {
    console.log("Existing health dataset cannot be decrypted with the current password; rebuilding.");
    return null;
  }
}

const reports = await loadReports();
const existing = await loadExistingReports();
if (existing && JSON.stringify(existing) === JSON.stringify(reports)) {
  console.log(`Health dataset unchanged (${reports.length} reports).`);
} else {
  const payload = await encryptJson({ version: 1, updatedAt: new Date().toISOString(), reports }, FITNESS_PASSWORD);
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(payload));
  console.log(`Wrote ${reports.length} reports to ${path.relative(ROOT, DATA_PATH)}.`);
}
