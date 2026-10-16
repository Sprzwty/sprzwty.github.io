#!/usr/bin/env node
/**
 * Notion → encrypted fitness dataset (public/fitness/data.enc.json), plus an optional mirror back into Notion.
 *
 *   1. Downloads every Motra .xlsx attached to an un-ticked row of the import database, parses and merges it
 *      into the existing dataset, re-encrypts with FITNESS_PASSWORD, then ticks "Imported".
 *   2. If NOTION_FITNESS_WORKOUT_DATABASE_ID is set, creates a Notion page (with a per-set table) for every
 *      workout that is not mirrored yet — so the first run backfills the whole history.
 *
 * Requires env: NOTION_TOKEN, NOTION_FITNESS_IMPORT_DATABASE_ID, FITNESS_PASSWORD
 * Optional env: NOTION_FITNESS_WORKOUT_DATABASE_ID, FITNESS_TIME_ZONE (IANA zone of the exported local times)
 * Needs Node ≥ 22.18 (imports the site's TypeScript modules via built-in type stripping).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "@notionhq/client";
import { withNotionRetry, readProperty } from "./lib/notion-helpers.mjs";
import { IMPORT_PROPS, WORKOUT_PROPS } from "./lib/fitness-notion-schema.mjs";
import { readFirstSheet } from "../src/app/lib/fitness/xlsx.ts";
import { parseMotraRows, mergeWorkouts } from "../src/app/lib/fitness/motra.ts";
import { encryptJson, decryptJson } from "../src/app/lib/fitness/crypto.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "public/fitness/data.enc.json");
const NOTION_TABLE_MAX_ROWS = 100;

const {
  NOTION_TOKEN,
  NOTION_FITNESS_IMPORT_DATABASE_ID: IMPORT_DB,
  NOTION_FITNESS_WORKOUT_DATABASE_ID: WORKOUT_DB,
  FITNESS_PASSWORD,
  FITNESS_TIME_ZONE,
} = process.env;

if (!NOTION_TOKEN || !IMPORT_DB || !FITNESS_PASSWORD) {
  console.error("Missing NOTION_TOKEN, NOTION_FITNESS_IMPORT_DATABASE_ID or FITNESS_PASSWORD.\nSee docs/NOTION_SYNC.md.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function queryAll(databaseId, filter) {
  const pages = [];
  let cursor;
  do {
    const res = await withNotionRetry(
      () => notion.databases.query({ database_id: databaseId, start_cursor: cursor, filter }),
      { label: "databases.query" }
    );
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

async function loadDataset() {
  if (!fs.existsSync(DATA_PATH)) return { version: 1, updatedAt: "", workouts: [] };
  return decryptJson(JSON.parse(fs.readFileSync(DATA_PATH, "utf8")), FITNESS_PASSWORD);
}

async function saveDataset(workouts) {
  const payload = await encryptJson({ version: 1, updatedAt: new Date().toISOString(), workouts }, FITNESS_PASSWORD);
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(payload));
}

async function downloadXlsx(file) {
  const url = file.type === "external" ? file.external.url : file.file.url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${file.name}`);
  return res.arrayBuffer();
}

async function importPendingFiles(existing) {
  const pending = await queryAll(IMPORT_DB, { property: IMPORT_PROPS.imported, checkbox: { equals: false } });
  let workouts = existing;
  const done = [];
  for (const page of pending) {
    const files = page.properties[IMPORT_PROPS.file]?.files ?? [];
    const label = readProperty(page.properties, IMPORT_PROPS.name) || page.id;
    if (files.length === 0) continue;
    const before = workouts.length;
    for (const file of files) {
      workouts = mergeWorkouts(workouts, parseMotraRows(await readFirstSheet(await downloadXlsx(file))));
    }
    console.log(`  ${label}: +${workouts.length - before} workouts`);
    done.push({ page, added: workouts.length - before });
  }
  return { workouts, done };
}

async function markImported({ page, added }) {
  await withNotionRetry(
    () =>
      notion.pages.update({
        page_id: page.id,
        properties: {
          [IMPORT_PROPS.imported]: { checkbox: true },
          [IMPORT_PROPS.result]: {
            rich_text: [{ type: "text", text: { content: `+${added} workouts · ${new Date().toISOString().slice(0, 16)}Z` } }],
          },
        },
      }),
    { label: "pages.update import" }
  );
}

const text = (content) => [{ type: "text", text: { content: String(content) } }];

function setsTable(sets) {
  const header = ["Exercise", "kg", "Reps", "Time (s)", "Muscles"];
  const rows = [header, ...sets.map((s) => [s.exercise, s.weightKg, s.reps, s.timeSec, s.muscles.join(", ")])];
  return {
    type: "table",
    table: {
      table_width: header.length,
      has_column_header: true,
      children: rows.slice(0, NOTION_TABLE_MAX_ROWS).map((cells) => ({
        type: "table_row",
        table_row: { cells: cells.map(text) },
      })),
    },
  };
}

function workoutProperties(w) {
  const muscles = [...new Set(w.sets.flatMap((s) => s.muscles))];
  const props = {
    [WORKOUT_PROPS.name]: { title: text(w.title) },
    [WORKOUT_PROPS.id]: { rich_text: text(w.id) },
    [WORKOUT_PROPS.date]: {
      date: {
        start: w.start.replace(" ", "T"),
        end: w.end ? w.end.replace(" ", "T") : null,
        time_zone: FITNESS_TIME_ZONE || null,
      },
    },
    [WORKOUT_PROPS.type]: { select: { name: w.type } },
    [WORKOUT_PROPS.durationMin]: { number: Math.round(w.durationSec / 60) },
    [WORKOUT_PROPS.calories]: { number: w.calories },
    [WORKOUT_PROPS.sets]: { number: w.sets.length },
    [WORKOUT_PROPS.volumeKg]: { number: w.volumeKg },
    [WORKOUT_PROPS.muscles]: { multi_select: muscles.map((name) => ({ name })) },
  };
  if (w.effort !== null) props[WORKOUT_PROPS.effort] = { number: w.effort };
  return props;
}

async function mirrorToNotion(workouts) {
  const mirrored = new Set(
    (await queryAll(WORKOUT_DB)).map((p) => readProperty(p.properties, WORKOUT_PROPS.id)).filter(Boolean)
  );
  const missing = workouts.filter((w) => !mirrored.has(w.id));
  console.log(`Mirroring ${missing.length} workout(s) to Notion (${mirrored.size} already there)...`);
  for (const w of missing) {
    await withNotionRetry(
      () =>
        notion.pages.create({
          parent: { database_id: WORKOUT_DB },
          properties: workoutProperties(w),
          children: w.sets.length > 0 ? [setsTable(w.sets)] : [],
        }),
      { label: `pages.create ${w.id}` }
    );
  }
}

async function main() {
  const dataset = await loadDataset();
  console.log(`Existing dataset: ${dataset.workouts.length} workouts.`);

  const { workouts, done } = await importPendingFiles(dataset.workouts);
  if (done.length > 0) {
    await saveDataset(workouts);
    console.log(`Wrote ${workouts.length} workouts to ${path.relative(ROOT, DATA_PATH)}.`);
    for (const item of done) await markImported(item);
  } else {
    console.log("No pending imports.");
  }

  if (WORKOUT_DB) await mirrorToNotion(workouts);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
