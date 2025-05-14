import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { generateObject } from 'ai';
import { getModel } from '@/lib/utils/modelUtils';

// Import existing categorized program names
import { weaponSpendingProgramNames } from '../lib/federal-spending/weapon-spending-items';
import { illegalDrugSpendingProgramNames } from '../lib/federal-spending/illegal-drug-spending-items';
import { medicalResearchSpendingProgramNames } from '../lib/federal-spending/medical-research-spending-items';
import { povertySpendingProgramNames } from '../lib/federal-spending/poverty-spending-items';
import { illegalImmigrationSpendingProgramNames } from '../lib/federal-spending/illegal-immigration-spending-items';
import { corporateSubsidySpendingProgramNames } from '../lib/federal-spending/corporate-subsidy-spending-items';
import { criminalLawSpendingProgramNames } from '../lib/federal-spending/criminal-law-spending-items';

// Import NEWLY ADDED categorized program names
import { nationalDefenseSpendingProgramNames } from '../lib/federal-spending/national-defense-spending-items';
import { veteransAffairsSpendingProgramNames } from '../lib/federal-spending/veterans-affairs-spending-items';
import { healthScienceAgenciesSpendingProgramNames } from '../lib/federal-spending/health-science-agencies-spending-items';
import { educationTrainingEmploymentSpendingProgramNames } from '../lib/federal-spending/education-training-employment-spending-items';
import { transportationInfrastructureSpendingProgramNames } from '../lib/federal-spending/transportation-infrastructure-spending-items';
import { homelandSecurityJusticeSpendingProgramNames } from '../lib/federal-spending/homeland-security-justice-spending-items';
import { internationalAffairsSpendingProgramNames } from '../lib/federal-spending/international-affairs-spending-items';
import { environmentEnergyNaturalResourcesSpendingProgramNames } from '../lib/federal-spending/environment-energy-natural-resources-spending-items';
import { housingCommunityDevSpendingProgramNames } from '../lib/federal-spending/housing-community-dev-spending-items';
import { generalGovernmentOtherSpendingProgramNames } from '../lib/federal-spending/general-government-other-spending-items';
import { cultureMediaSmallAgenciesSpendingProgramNames } from '../lib/federal-spending/culture-media-small-agencies-spending-items';

const OUTPUT_FILE = path.join(__dirname, 'wishingWell_ai_generated_programs.json');

// Combine all imported program name arrays
const ALL_PROGRAM_NAMES_TO_DETAIL: string[] = [
  ...weaponSpendingProgramNames,
  ...illegalDrugSpendingProgramNames,
  ...medicalResearchSpendingProgramNames,
  ...povertySpendingProgramNames,
  ...illegalImmigrationSpendingProgramNames,
  ...corporateSubsidySpendingProgramNames,
  ...criminalLawSpendingProgramNames,
  // Add newly categorized lists
  ...nationalDefenseSpendingProgramNames,
  ...veteransAffairsSpendingProgramNames,
  ...healthScienceAgenciesSpendingProgramNames,
  ...educationTrainingEmploymentSpendingProgramNames,
  ...transportationInfrastructureSpendingProgramNames,
  ...homelandSecurityJusticeSpendingProgramNames,
  ...internationalAffairsSpendingProgramNames,
  ...environmentEnergyNaturalResourcesSpendingProgramNames,
  ...housingCommunityDevSpendingProgramNames,
  ...generalGovernmentOtherSpendingProgramNames,
  ...cultureMediaSmallAgenciesSpendingProgramNames,

  // Remaining manually added items (review if any are covered by new broad categories)
  "Mental Health & Suicide Prevention Grants", 
  "K-12 STEM Education Funding", 
  "Rural Broadband Deployment Grants", 
  "Port Infrastructure Development", 
  "Clean Water Infrastructure Grants", 
  "NIST - AI Research Funding", 
  "EPA - Superfund Site Cleanup", 
  "Forest Service - Wildfire Prevention", 
  "Endangered Species Habitat Recovery", 
  "National Parks Maintenance Initiative", 
];

// Remove duplicates that might have occurred from cross-listing
const PROGRAM_NAMES_TO_DETAIL = [...new Set(ALL_PROGRAM_NAMES_TO_DETAIL)];

// Schema for the details AI needs to generate for a given program name
const AiProgramDetailsSchema = z.object({
  programDescription: z.string().describe("A brief (1-2 sentences) explanation of the program's specific purpose in simple terms."),
  programCategory: z.string().describe("A high-level category (e.g., Healthcare, Environment, Education, Infrastructure, Science/Tech, Public Safety, Energy, Social Services, Defense, Veterans Affairs, International Aid, General Government, Culture & Media)."),
  estimatedAnnualBudgetMillions: z.number().positive().describe("A plausible estimated annual budget for this specific program in millions of USD. Be realistic for the program's scope."),
});

// Type for the combined item including the provided name and AI-generated details
interface FullProgramInfo extends z.infer<typeof AiProgramDetailsSchema> {
  programName: string;
}

async function generateProgramDetails() {
  console.log(`Attempting to generate details for ${PROGRAM_NAMES_TO_DETAIL.length} predefined program names from categorized lists...`);

  const allGeneratedPrograms: FullProgramInfo[] = [];

  for (const programName of PROGRAM_NAMES_TO_DETAIL) {
    console.log(`\\n🤖 Processing: \"${programName}\"`);

    const prompt = `
      For the United States federal program named: \"${programName}\"

      Please provide the following details:
      1. programDescription: A brief (1-2 sentences) explanation of this program's specific purpose and what it does, in simple terms for a citizen to understand.
      2. programCategory: A relevant high-level category for this program (e.g., Healthcare, Environment, Education, Infrastructure, Science/Tech, Public Safety, Energy, Social Services, Defense, Veterans Affairs, International Aid, General Government, Culture & Media).
      3. estimatedAnnualBudgetMillions: A plausible estimated annual budget specifically for \"${programName}\" in millions of USD. Consider its likely scope and impact when estimating the budget.

      Ensure the description is specific to \"${programName}\". Avoid overly generic statements.
      Return the output as a JSON object conforming to the defined schema (programDescription, programCategory, estimatedAnnualBudgetMillions).
    `;

    try {
      const { object: details } = await generateObject({
        model: getModel(),
        schema: AiProgramDetailsSchema, 
        prompt: prompt,
        temperature: 0.5, 
      });
      
      allGeneratedPrograms.push({ programName, ...details });
      console.log(`   ✅ Details generated for \"${programName}\": Budget $${details.estimatedAnnualBudgetMillions}M, Category: ${details.programCategory}`);

    } catch (error) {
      console.error(`❌ Failed to generate details for \"${programName}\".`);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
      } else {
        console.error('   Caught non-Error object:', error);
      }
      allGeneratedPrograms.push({
        programName,
        programDescription: "Error generating details for this program.",
        programCategory: "Error",
        estimatedAnnualBudgetMillions: 0,
      });
    }
  }

  if (allGeneratedPrograms.length === 0) {
    console.error('No program details were successfully generated.');
    process.exit(1); 
  }

  console.log(`\\nSuccessfully processed ${allGeneratedPrograms.length} program names.`);

  const wishingWellItems = allGeneratedPrograms.map((program, index) => ({
    id: `prog-${program.programName.toLowerCase().replace(/\\W+/g, '-').substring(0, 50)}-${index}`,
    userId: 'ai-curated-program-generator',
    name: program.programName,
    description: program.programDescription,
    content: `Category: ${program.programCategory}`,
    images: null,
    featuredImage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    averageAllocation: String(program.estimatedAnnualBudgetMillions * 1000000),
    embedding: null,
    originalName: program.programName, 
    originalDescription: program.programDescription, 
    programType: program.programCategory,
  }));

  try {
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(wishingWellItems, null, 2));
    console.log(`Successfully saved ${wishingWellItems.length} AI-detailed program examples to ${OUTPUT_FILE}`);
  } catch (saveError) {
      console.error('Failed to save AI program examples to file. Script will terminate.');
      if (saveError instanceof Error) {
        console.error('Error message:', saveError.message);
      }
      process.exit(1);
  }
}

generateProgramDetails(); 