#!/usr/bin/env node
/**
 * One-time setup: creates the two fitness databases under a Notion page.
 *
 * Requires env:
 *   NOTION_TOKEN                     — integration secret (the integration must already be connected to the parent page)
 *   NOTION_FITNESS_PARENT_PAGE_ID    — page the databases are created under
 *
 * Prints the new database ids; store them as the GitHub secrets
 * NOTION_FITNESS_IMPORT_DATABASE_ID and NOTION_FITNESS_WORKOUT_DATABASE_ID.
 */

import { Client } from "@notionhq/client";
import { withNotionRetry } from "./lib/notion-helpers.mjs";
import { IMPORT_SCHEMA, WORKOUT_SCHEMA } from "./lib/fitness-notion-schema.mjs";

const { NOTION_TOKEN, NOTION_FITNESS_PARENT_PAGE_ID } = process.env;

if (!NOTION_TOKEN || !NOTION_FITNESS_PARENT_PAGE_ID) {
  console.error("Missing NOTION_TOKEN or NOTION_FITNESS_PARENT_PAGE_ID.\nSee docs/NOTION_SYNC.md for setup.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function createDatabase(title, properties) {
  const db = await withNotionRetry(
    () =>
      notion.databases.create({
        parent: { type: "page_id", page_id: NOTION_FITNESS_PARENT_PAGE_ID },
        title: [{ type: "text", text: { content: title } }],
        properties,
      }),
    { label: `databases.create ${title}` }
  );
  return db.id;
}

async function main() {
  const importId = await createDatabase("Fitness Imports", IMPORT_SCHEMA);
  const workoutId = await createDatabase("Workouts", WORKOUT_SCHEMA);
  console.log(`NOTION_FITNESS_IMPORT_DATABASE_ID=${importId}`);
  console.log(`NOTION_FITNESS_WORKOUT_DATABASE_ID=${workoutId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
