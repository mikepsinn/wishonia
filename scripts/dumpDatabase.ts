// This script is intended to be run with a TypeScript runner like tsx or ts-node
// Example: pnpm tsx scripts/dumpDatabase.ts test
//          pnpm tsx scripts/dumpDatabase.ts full

import {
  dumpFullDatabaseToJson,
  dumpTestDatabaseToJson,
} from "@/lib/prisma/dumpDatabaseToJson";

async function dumpTestDB() {
  console.log("Starting: Dumping the test database to JSON files...");
  await dumpTestDatabaseToJson();
  console.log("Completed: Dumping the test database.");
}

async function dumpFullDB() {
  console.log("Starting: Dumping the full database to JSON files...");
  await dumpFullDatabaseToJson();
  console.log("Completed: Dumping the full database.");
}

async function main() {
  const arg = process.argv[2]; // Get the first argument after script name

  if (arg === 'test') {
    await dumpTestDB();
  } else if (arg === 'full') {
    await dumpFullDB();
  } else {
    if (arg) {
        console.log(`Unknown argument: '${arg}'.`);
    }
    console.log("Usage: pnpm tsx scripts/dumpDatabase.ts [test|full]");
    console.log("Please specify 'test' to dump the test database or 'full' to dump the full database.");
    // Example: To dump the test database by default if no valid argument:
    // console.log("Defaulting to test database dump.");
    // await dumpTestDB();
  }

  console.log("Database dump script operations complete.");
}

main().catch((e) => {
  console.error("Error during database dump process:", e);
  process.exit(1);
}); 