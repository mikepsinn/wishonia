import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { generateObject } from 'ai';
import { getModel } from '@/lib/utils/modelUtils';

const OUTPUT_FILE = path.join(__dirname, 'wishingWell_ai_generated_programs.json');

// ** CURATED LIST OF PROGRAM NAMES **
const PROGRAM_NAMES_TO_DETAIL: string[] = [
  // Defense / International Affairs / Intelligence
  "Military Aid Package for Ukraine",
  "Logistical and Intelligence Support for Operations in Yemen",
  "Counter-terrorism Intelligence Gathering and Operations (Global)",
  "Development of Next-Generation Unmanned Aerial Vehicles (UAVs)",
  "Naval Shipbuilding and Fleet Modernization Program",
  "International Food Aid and Emergency Famine Relief",
  "Funding for NATO Joint Defense Initiatives",
  "National Cybersecurity Infrastructure Protection",
  "Foreign Military Sales Program Administration and Oversight",
  "US Embassy and Diplomatic Security Upgrades Worldwide",
  "Peacekeeping Operations Contributions and Support",
  "Foreign Aid for Democratic Governance Initiatives in Developing Nations",

  // Law Enforcement / Justice / Immigration
  "Federal Drug Interdiction and Trafficking Task Forces (General)",
  "Funding for Federal Prison System (Capacity and Rehabilitation Programs)",
  "DEA - Covert Operations for Major Drug Cartel Disruption",
  "ICE - Immigration Detention Center Operations and Standards",
  "ICE - Enforcement and Removal Operations (Targeting Fugitive Aliens)",
  "Customs and Border Protection - Border Security Technology Deployment",
  "Community Oriented Policing Services (COPS) Hiring Grants",
  "ATF - Efforts to Combat Illegal Firearms Trafficking",
  "Federal Public Defender Services for Indigent Defendants",
  "Grants for Juvenile Justice and Delinquency Prevention Programs",
  "Body-Worn Camera Programs for Federal Law Enforcement",
  "DEA - Task Force for Fentanyl Precursor Chemical Interdiction",
  "Inter-Agency Task Force for Combating Methamphetamine Distribution Networks",
  "IRS - Enhanced Tax Fraud Detection and Enforcement Technology",
  "Development of Advanced Non-Lethal Crowd Control Technologies for Federal Use",

  // Healthcare (including specific NIH Research)
  "NIH - Research Grants for Opioid Addiction and Pain Management Alternatives",
  "CDC - Global Disease Outbreak and Pandemic Preparedness",
  "Expansion of Community Health Centers in Underserved Areas",
  "Mental Health Services and Suicide Prevention Block Grants",
  "Indian Health Service - Clinical Services Improvement",
  "NIH - Alzheimer\'s Disease and Related Dementias Research Funding",
  "NIH - Pediatric Cancer Research Initiative",
  "NIH - Clinical Trials for Universal Flu Vaccine Development",
  "NIH - Traumatic Brain Injury (TBI) Research for Veterans and Civilians",
  "NIH - Funding for Rare Disease Clinical Research Network",
  "NIH - Advanced Research on Sickle Cell Disease Treatments",

  // Education
  "Pell Grants for Low-Income Undergraduate Students",
  "Head Start and Early Head Start Child Development Programs",
  "IDEA - Grants to States for Special Education Services",
  "Funding for STEM Education Outreach and Teacher Training (K-12)",
  "Title I Grants for Disadvantaged Students",

  // Infrastructure / Transportation
  "Amtrak National Rail Network Subsidies and Improvement Grants",
  "Federal Highway Administration - Bridge Repair and Replacement Program",
  "Modernization of National Air Traffic Control Systems",
  "Rural Broadband Deployment Grants (ReConnect Program)",
  "Port Infrastructure Development Grants for Supply Chain Resilience",
  "Clean Water Infrastructure Modernization Grants",

  // Science & Technology
  "NASA - Artemis Program: Lunar Exploration and Mars Preparation",
  "National Science Foundation (NSF) - Fundamental Research Grants",
  "DOE - Advanced Research Projects Agency-Energy (ARPA-E)",
  "National Institute of Standards and Technology (NIST) - AI Research",

  // Environment & Energy
  "EPA - Superfund National Priorities List Site Cleanup",
  "US Forest Service - Wildfire Prevention and Suppression Operations",
  "Development of Utility-Scale Renewable Energy Projects (e.g., Solar, Wind)",
  "Endangered Species Act - Habitat Conservation and Recovery Programs",
  "DOE - Research into Advanced Carbon Capture and Sequestration Technologies",
  "National Parks System - Deferred Maintenance Backlog Reduction Initiative",

  // Social Services / Housing / Economic Development
  "Section 8 Housing Choice Voucher Program",
  "Low Income Home Energy Assistance Program (LIHEAP)",
  "Community Development Block Grants for Local Initiatives",
  "Small Business Administration (SBA) - Loan Guarantee Programs",
  "Veterans Affairs - Mental Health and Suicide Prevention Outreach",
  "Workforce Innovation and Opportunity Act (WIOA) Job Training Grants",
  "Support Programs for Homeless Veterans (Housing, Healthcare, Job Training)",
  "Expansion of Child Care Subsidies for Low-Income Working Families",

  // General Government / Other
  "Funding for Congressional Office Operations and Staffing"
];

// Schema for the details AI needs to generate for a given program name
const AiProgramDetailsSchema = z.object({
  programDescription: z.string().describe("A brief (1-2 sentences) explanation of the program's specific purpose in simple terms."),
  programCategory: z.string().describe("A high-level category (e.g., Healthcare, Environment, Education, Infrastructure, Science/Tech, Public Safety, Energy, Social Services)."),
  estimatedAnnualBudgetMillions: z.number().positive().describe("A plausible estimated annual budget for this specific program in millions of USD. Be realistic for the program's scope."),
});

// Type for the combined item including the provided name and AI-generated details
interface FullProgramInfo extends z.infer<typeof AiProgramDetailsSchema> {
  programName: string;
}

async function generateProgramDetails() {
  console.log(`Attempting to generate details for ${PROGRAM_NAMES_TO_DETAIL.length} predefined program names...`);

  const allGeneratedPrograms: FullProgramInfo[] = [];

  for (const programName of PROGRAM_NAMES_TO_DETAIL) {
    console.log(`\n🤖 Processing: "${programName}"`);

    const prompt = `
      For the United States federal program named: "${programName}"

      Please provide the following details:
      1. programDescription: A brief (1-2 sentences) explanation of this program's specific purpose and what it does, in simple terms for a citizen to understand.
      2. programCategory: A relevant high-level category for this program (e.g., Healthcare, Environment, Education, Infrastructure, Science/Tech, Public Safety, Energy, Social Services, Defense, Veterans Affairs, International Aid, General Government).
      3. estimatedAnnualBudgetMillions: A plausible estimated annual budget specifically for "${programName}" in millions of USD. Consider its likely scope and impact when estimating the budget.

      Ensure the description is specific to "${programName}". Avoid overly generic statements.
      Return the output as a JSON object conforming to the defined schema (programDescription, programCategory, estimatedAnnualBudgetMillions).
    `;

    try {
      const { object: details } = await generateObject({
        model: getModel(),
        schema: AiProgramDetailsSchema, 
        prompt: prompt,
        temperature: 0.5, // Slightly less creative, more focused on the given program
      });
      
      allGeneratedPrograms.push({ programName, ...details });
      console.log(`   ✅ Details generated for "${programName}": Budget $${details.estimatedAnnualBudgetMillions}M, Category: ${details.programCategory}`);

    } catch (error) {
      console.error(`❌ Failed to generate details for "${programName}".`);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
        // Optionally, decide if you want to skip this item or halt the script
        // For now, we'll log and continue to try and get as much data as possible.
      } else {
        console.error('   Caught non-Error object:', error);
      }
      // Add a placeholder or skip if needed, or re-throw to stop all processing
      // For demo, let's add a placeholder so the list length is maintained if desired.
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
    process.exit(1); // Exit if nothing was generated at all.
  }

  console.log(`\nSuccessfully processed ${allGeneratedPrograms.length} program names.`);

  const wishingWellItems = allGeneratedPrograms.map((program, index) => ({
    // id: `ai-program-${program.programCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${program.programName.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0,30)}-${index + 1}`,
    // Create a more robust ID from the program name itself
    id: `prog-${program.programName.toLowerCase().replace(/\W+/g, '-').substring(0, 50)}-${index}`,
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