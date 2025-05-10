// This script is intended to be run with a TypeScript runner like tsx or ts-node
// Example: pnpm tsx scripts/seedDatabase.ts

import { seedGlobalProblemPairAllocations } from "@/prisma/seedGlobalProblemPairAllocations";
import { seedGlobalProblemSolutionPairAllocations } from "@/prisma/seedGlobalProblemSolutionPairAllocations";
import { seedGlobalSolutionPairAllocations } from "@/prisma/seedGlobalSolutionPairAllocations";
// The following import is from test helpers, consider if this is appropriate for a general script
import { getOrCreateTestUser } from "@/tests/test-helpers";

import { loadJsonToDatabase } from "@/lib/prisma/loadDatabaseFromJson";
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function seedFromJsonDump() {
  console.log("Starting: Seeding from JSON dump...");
  // Using getOrCreateTestUser from test helpers.
  // For a general script, you might want to pass a userId or use a different mechanism.
  const user = await getOrCreateTestUser();
  console.log(`Using user ID: ${user.id} for seeding some tables.`);

  await loadJsonToDatabase("User");
  await loadJsonToDatabase("GlobalSolution", user.id);
  await loadJsonToDatabase("GlobalProblem", user.id);
  await loadJsonToDatabase("GlobalProblemSolution", user.id);
  await seedGlobalProblemPairAllocations(user);
  await seedGlobalProblemSolutionPairAllocations(user);
  await seedGlobalSolutionPairAllocations(user);
  await loadJsonToDatabase("WishingWell", user.id);
  console.log("Completed: Seeding from JSON dump.");
}

async function importDfdaCauses() {
  console.log("Starting: Importing DfdaCause from JSON file...");
  const prisma = new PrismaClient(); // Local Prisma client for this function

  try {
    const jsonPath = path.join(process.cwd(), 'prisma', 'ct_causes.json');
    if (!fs.existsSync(jsonPath)) {
      console.error(`Error: JSON file not found at ${jsonPath}`);
      return;
    }
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    for (const cause of jsonData) {
      await prisma.dfdaCause.create({
        data: {
          id: cause.id,
          name: cause.name,
          updatedAt: new Date(cause.updated_at),
          createdAt: new Date(cause.created_at),
          deletedAt: cause.deleted_at ? new Date(cause.deleted_at) : null,
          numberOfConditions: cause.number_of_conditions,
        },
      });
    }
    console.log(`Completed: Imported ${jsonData.length} DfdaCause records.`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log("Running database seeding script...");

  // The original test file had an `assertTestDB()` call in `beforeAll`.
  // If this script needs to run against a specific (e.g., test) database
  // or ensure certain conditions, that logic should be explicitly handled here or configured.

  await seedFromJsonDump();
  await importDfdaCauses();

  console.log("All seeding operations in seedDatabase.ts complete.");
}

main().catch((e) => {
  console.error("Error during seeding process:", e);
  process.exit(1);
}); 