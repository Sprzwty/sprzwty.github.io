// Column names shared by setup-fitness-notion.mjs (creates the databases) and sync-fitness.mjs (reads/writes them).

export const IMPORT_PROPS = {
  name: "Name",
  file: "File",
  imported: "Imported",
  result: "Result",
};

export const WORKOUT_PROPS = {
  name: "Name",
  id: "ID",
  date: "Date",
  type: "Type",
  durationMin: "Duration (min)",
  calories: "Calories",
  sets: "Sets",
  volumeKg: "Volume (kg)",
  muscles: "Muscles",
  effort: "Effort",
};

export const IMPORT_SCHEMA = {
  [IMPORT_PROPS.name]: { title: {} },
  [IMPORT_PROPS.file]: { files: {} },
  [IMPORT_PROPS.imported]: { checkbox: {} },
  [IMPORT_PROPS.result]: { rich_text: {} },
};

export const WORKOUT_SCHEMA = {
  [WORKOUT_PROPS.name]: { title: {} },
  [WORKOUT_PROPS.id]: { rich_text: {} },
  [WORKOUT_PROPS.date]: { date: {} },
  [WORKOUT_PROPS.type]: { select: {} },
  [WORKOUT_PROPS.durationMin]: { number: {} },
  [WORKOUT_PROPS.calories]: { number: {} },
  [WORKOUT_PROPS.sets]: { number: {} },
  [WORKOUT_PROPS.volumeKg]: { number: {} },
  [WORKOUT_PROPS.muscles]: { multi_select: {} },
  [WORKOUT_PROPS.effort]: { number: {} },
};
