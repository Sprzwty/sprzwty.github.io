#!/usr/bin/env node
/**
 * Creates one "Health Checkups" row from a transcribed report JSON, optionally attaching the original PDF.
 *
 *   node scripts/import-health-report.mjs <report.json> [--pdf <report.pdf>]
 *
 * JSON: { "title", "date": "YYYY-MM-DD", "facility", "summary", "results": [{ key, item, value, unit, range, flag }] }
 * Keep these files out of git (e.g. under _local/). A row with the same Date and Name is never created twice.
 *
 * Requires env: NOTION_TOKEN, NOTION_HEALTH_DATABASE_ID
 */

import fs from "fs";
import path from "path";
import { Client } from "@notionhq/client";
import { withNotionRetry, fetchAllPages, readProperty } from "./lib/notion-helpers.mjs";
import { HEALTH_PROPS, RESULT_COLUMNS } from "./lib/health-notion-schema.mjs";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
/** Notion caps block children per request; one row is the table header. */
const TABLE_MAX_BODY_ROWS = 99;

const { NOTION_TOKEN, NOTION_HEALTH_DATABASE_ID: HEALTH_DB } = process.env;
const [jsonPath, ...rest] = process.argv.slice(2);
const pdfFlag = rest.indexOf("--pdf");
const pdfPath = pdfFlag >= 0 ? rest[pdfFlag + 1] : undefined;

if (!NOTION_TOKEN || !HEALTH_DB || !jsonPath) {
  console.error("Usage: node scripts/import-health-report.mjs <report.json> [--pdf <file.pdf>]\nRequires NOTION_TOKEN and NOTION_HEALTH_DATABASE_ID.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });
const report = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const text = (content) => (content ? [{ type: "text", text: { content: String(content) } }] : []);

/** Notion File Upload API (single part, ≤ 20 MB); the SDK version in use has no helper for it. */
async function uploadFile(filePath) {
  const headers = { Authorization: `Bearer ${NOTION_TOKEN}`, "Notion-Version": NOTION_VERSION };
  const filename = path.basename(filePath);
  const created = await fetch(`${NOTION_API}/file_uploads`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "single_part", filename, content_type: "application/pdf" }),
  });
  if (!created.ok) throw new Error(`file_uploads create: HTTP ${created.status} ${await created.text()}`);
  const { id } = await created.json();
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(filePath)], { type: "application/pdf" }), filename);
  const sent = await fetch(`${NOTION_API}/file_uploads/${id}/send`, { method: "POST", headers, body: form });
  if (!sent.ok) throw new Error(`file_uploads send: HTTP ${sent.status} ${await sent.text()}`);
  return { type: "file_upload", file_upload: { id }, name: filename };
}

function resultTables(results) {
  const tables = [];
  for (let i = 0; i < results.length; i += TABLE_MAX_BODY_ROWS) {
    const rows = [
      RESULT_COLUMNS,
      ...results.slice(i, i + TABLE_MAX_BODY_ROWS).map((r) => [r.key, r.item, r.value, r.unit, r.range, r.flag]),
    ];
    tables.push({
      type: "table",
      table: {
        table_width: RESULT_COLUMNS.length,
        has_column_header: true,
        children: rows.map((cells) => ({ type: "table_row", table_row: { cells: cells.map((c) => text(c ?? "")) } })),
      },
    });
  }
  return tables;
}

const duplicate = (await fetchAllPages(notion, HEALTH_DB)).find(
  (p) => readProperty(p.properties, HEALTH_PROPS.date)?.slice(0, 10) === report.date
    && readProperty(p.properties, HEALTH_PROPS.name) === report.title
);
if (duplicate) {
  console.log(`Already in Notion: ${report.date} ${report.title} (${duplicate.url})`);
  process.exit(0);
}

const properties = {
  [HEALTH_PROPS.name]: { title: text(report.title) },
  [HEALTH_PROPS.date]: { date: { start: report.date } },
  [HEALTH_PROPS.facility]: { rich_text: text(report.facility) },
  [HEALTH_PROPS.summary]: { rich_text: text(report.summary) },
};
if (pdfPath) properties[HEALTH_PROPS.report] = { files: [await uploadFile(pdfPath)] };

const page = await withNotionRetry(
  () => notion.pages.create({ parent: { database_id: HEALTH_DB }, properties, children: resultTables(report.results) }),
  { label: `pages.create ${report.date}` }
);
console.log(`Created ${report.date} ${report.title}: ${report.results.length} results → ${page.url}`);
