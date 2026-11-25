// Shared by setup-health-notion.mjs, import-health-report.mjs and sync-health.mjs.
// One database row per checkup; the results live in a table in the page body (one row per item),
// so items that a new report adds need no schema change.

export const HEALTH_PROPS = {
  name: "Name",
  date: "Date",
  facility: "Facility",
  summary: "Summary",
  report: "Report",
};

export const HEALTH_SCHEMA = {
  [HEALTH_PROPS.name]: { title: {} },
  [HEALTH_PROPS.date]: { date: {} },
  [HEALTH_PROPS.facility]: { rich_text: {} },
  [HEALTH_PROPS.summary]: { rich_text: {} },
  [HEALTH_PROPS.report]: { files: {} },
};

/** Header row of the results table. Key = canonical id from src/app/lib/health/catalog.ts (falls back to Item). */
export const RESULT_COLUMNS = ["Key", "Item", "Value", "Unit", "Range", "Flag"];
