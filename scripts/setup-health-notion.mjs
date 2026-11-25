#!/usr/bin/env node
/**
 * One-time setup: creates the "Health Checkups" database under the fitness parent page.
 *
 * Requires env: NOTION_TOKEN, NOTION_FITNESS_PARENT_PAGE_ID
 * Prints the new database id; store it as the GitHub secret NOTION_HEALTH_DATABASE_ID.
 */

import { Client } from "@notionhq/client";
import { withNotionRetry } from "./lib/notion-helpers.mjs";
import { HEALTH_SCHEMA } from "./lib/health-notion-schema.mjs";

const { NOTION_TOKEN, NOTION_FITNESS_PARENT_PAGE_ID } = process.env;

if (!NOTION_TOKEN || !NOTION_FITNESS_PARENT_PAGE_ID) {
  console.error("Missing NOTION_TOKEN or NOTION_FITNESS_PARENT_PAGE_ID.\nSee docs/NOTION_SYNC.md for setup.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

const db = await withNotionRetry(
  () =>
    notion.databases.create({
      parent: { type: "page_id", page_id: NOTION_FITNESS_PARENT_PAGE_ID },
      title: [{ type: "text", text: { content: "Health Checkups" } }],
      properties: HEALTH_SCHEMA,
    }),
  { label: "databases.create Health Checkups" }
);
console.log(`NOTION_HEALTH_DATABASE_ID=${db.id}`);
