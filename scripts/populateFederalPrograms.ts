import 'dotenv/config'; // Load .env file from project root
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { generateObject } from 'ai';
import { getModel, logAvailableGoogleModels } from '@/lib/utils/modelUtils'; // Assuming this path is correct relative to the script location or TS path mapping

interface WishingWellItem {
  id: string;
  userId: string;
  name: string; // This will be the AI-refined name
  description: string | null; // This will be the AI-refined description
  content: string | null; // Could store original description or more details
  images: string[] | null;
  featuredImage: string | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  averageAllocation: string | null; // Changed to string to store formatted currency
  embedding: number[] | null;
  originalName?: string | null; // Store the original name from API
  originalDescription?: string | null; // Store the original description from API
  programType?: string | null; // Store the award type/description
}

// Zod schema for AI-generated program details
const ProgramDetailsSchema = z.object({
  refinedName: z.string().describe("A concise, citizen-friendly name for this federal program or award. If it's a specific project (e.g., 'F-35 Lightning II'), use that. If it's a broader category (e.g., 'Pell Grants'), use that. Avoid generic terms like 'Multiple Recipients' or 'Contract'. Make it sound like a distinct budget item."),
  refinedDescription: z.string().describe("A brief (1-2 sentences) explanation of what this program or award is for, in simple terms. Highlight the main purpose or beneficiary. This will help a citizen decide on its importance."),
  suggestedCategory: z.string().optional().describe("A high-level category for this program (e.g., Defense, Education, Healthcare, Infrastructure, Research).")
});

// Interface for the USAspending API award item (from spending_by_award)
interface AwardSpendingItem {
  "Award ID": number | string;
  recipient_name: string | null; // Can be null
  description: string | null;
  period_of_performance_start_date: string | null;
  period_of_performance_current_end_date: string | null;
  obligation: number | null;
  disaster_emergency_fund_codes: string[] | null;
  generated_internal_id: string | null;
  "Award Type": string | null;
  type_description: string | null;
  // Add other fields as needed based on actual API response
}

// Interface for the detailed award response from /api/v2/awards/<AWARD_ID>/
// This is a simplified version, actual response might be more complex
interface DetailedAward {
  id: number; // Internal ID from this endpoint
  generated_unique_award_id: string; // This might be the key we are looking for if "Award ID" was null
  type: string | null; // e.g., "CONTRACT", "GRANT"
  type_description: string | null;
  description: string | null;
  piid: string | null; // Likely "Award ID" for contracts
  fain: string | null; // Likely "Award ID" for financial assistance
  uri: string | null; // Likely "Award ID" for financial assistance
  recipient: {
    recipient_name: string | null;
    // ... other recipient details
  } | null;
  period_of_performance: {
    period_of_performance_start_date: string | null;
    period_of_performance_end_date: string | null;
  } | null;
  // ... other potential fields like subawards, amounts, etc.
}

// Interface for the USAspending API response
interface UsaSpendingApiResponse {
  page_metadata: {
    page: number;
    hasNext: boolean;
    count: number; // Total number of results if available, might not be in all endpoints
  };
  results: AwardSpendingItem[];
  messages?: string[][]; // Optional messages from the API
}

const USASPENDING_API_URL = 'https://api.usaspending.gov/api/v2/search/spending_by_award/';
const OUTPUT_FILE = path.join(__dirname, 'wishingWell_federal_spending_2023.json'); // Changed output file name
const USER_ID_PLACEHOLDER = 'usaspending.gov-importer';
const MAX_RESULTS_PER_PAGE = 5; // USAspending API limit - REDUCED FOR TESTING

async function fetchFederalPrograms(): Promise<WishingWellItem[]> {
  const requestBody = {
    filters: {
      time_period: [{ start_date: '2022-10-01', end_date: '2023-09-30' }], // FY 2023
      award_type_codes: [
        // Contracts and Orders
        'A', // BPA Call
        'B', // Purchase Order
        'C', // Delivery Order
        'D', // Definitive Contract
        // IDVs (Indefinite Delivery Vehicles)
        // IDV_A is GWAC, IDV_B is IDC etc. - the API seems to use these for filtering IDVs directly
        // However, the spending_by_award endpoint is for awards, so direct IDV codes might not apply here
        // or might need to be queried differently. For now, focusing on direct award types.
        // If we need IDV spending, that might be a separate query or endpoint.
        // Let's stick to the main award types for now as per the error message's requirement.
      ],
      // We might need to add keywords or program filters if we want to narrow down
      // For now, fetching all spending might be too broad.
      // Let's try to get a general sense of spending first or look for specific program-related spending.
      // For this example, let's assume we want to see all awards.
      // If we need to filter for "programs", the API might require different fields or a different endpoint.
    },
    fields: [
      'Award ID', // Changed from award_id
      'recipient_name',
      'description',
      'period_of_performance_start_date',
      'period_of_performance_current_end_date',
      'obligation',
      'Award Amount', // Adding 'Award Amount' to fields to ensure it can be sorted on
      'disaster_emergency_fund_codes', // Added for discretionary filtering
      'generated_internal_id', // Added as a fallback ID
      'Award Type', // Added field
      'type_description', // Added field
      // 'program_title' // If such a field exists and is useful
    ],
    page: 1,
    limit: MAX_RESULTS_PER_PAGE,
    sort: 'Award Amount', // Sort by Award Amount
    order: 'desc', // Get highest spending first
  };

  console.log(`Fetching data from: ${USASPENDING_API_URL} with body:`, JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(USASPENDING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API HTTP Error Response Text:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data: UsaSpendingApiResponse = (await response.json()) as UsaSpendingApiResponse;

    if (data.messages && data.messages.length > 0) {
      console.warn('API Messages:', data.messages);
    }
    
    if (!data.results) {
        console.error('API Error: No results found in response', data);
        throw new Error('API returned no results.');
    }


    console.log(`Found ${data.results.length} awards in the first page. Total might be more if pagination is handled.`);
    // Note: Proper pagination would involve checking data.page_metadata.hasNext and making subsequent requests.
    // For this example, we are only fetching the first page up to MAX_RESULTS_PER_PAGE.

    const wishingWellItems: WishingWellItem[] = [];

    for (const item of data.results) {
      let itemId: string | null = null;

      if (item["Award ID"] !== null && item["Award ID"] !== undefined && String(item["Award ID"]).trim() !== '') {
        itemId = String(item["Award ID"]);
      } else if (item.generated_internal_id !== null && item.generated_internal_id !== undefined && item.generated_internal_id.trim() !== '') {
        itemId = item.generated_internal_id;
        console.warn(`Using generated_internal_id (${itemId}) as fallback from spending_by_award for item: ${JSON.stringify(item)}`);
      } else {
        console.error(`Critical Error: Skipping item from spending_by_award due to missing or invalid ID fields (Award ID and generated_internal_id): ${JSON.stringify(item)}`);
        continue; // Skip this item
      }

      let currentRecipientName = item.recipient_name;
      let currentAwardType = item["Award Type"];
      let currentTypeDescription = item.type_description;
      let currentDescription = item.description;
      let currentPoPStartDate = item.period_of_performance_start_date;
      let currentPoPEndDate = item.period_of_performance_current_end_date;
      const obligationAmount = item.obligation;


      const effectiveTypeStringPrimary = currentTypeDescription || currentAwardType;

      // Check if primary data is insufficient
      if ((currentRecipientName === null || currentRecipientName === undefined || currentRecipientName.trim() === '' || currentRecipientName.toUpperCase() === 'MULTIPLE RECIPIENTS') && !effectiveTypeStringPrimary) {
        console.warn(`Primary data insufficient for ID: ${itemId} (Recipient: '${currentRecipientName}', Type: '${effectiveTypeStringPrimary}'). Attempting to fetch details from /api/v2/awards/...`);
        try {
          const detailApiUrl = `https://api.usaspending.gov/api/v2/awards/${encodeURIComponent(itemId)}/`;
          console.log("Fetching details from:", detailApiUrl);
          const detailResponse = await fetch(detailApiUrl);
          if (detailResponse.ok) {
            const detailedData = (await detailResponse.json()) as DetailedAward;
            console.log("Successfully fetched details for", itemId, ":", JSON.stringify(detailedData, null, 2).substring(0, 500) + "...");
            
            // Update current variables with data from detailed endpoint if available
            if (detailedData.recipient?.recipient_name) {
              currentRecipientName = detailedData.recipient.recipient_name;
            }
            currentTypeDescription = detailedData.type_description || currentTypeDescription; // Prioritize detailed data
            currentAwardType = detailedData.type || currentAwardType; // Prioritize detailed data
            currentDescription = detailedData.description || currentDescription;
            currentPoPStartDate = detailedData.period_of_performance?.period_of_performance_start_date || currentPoPStartDate;
            currentPoPEndDate = detailedData.period_of_performance?.period_of_performance_end_date || currentPoPEndDate;
            
            // If the main itemId was a generated_internal_id, try to get a more official one like PIID/FAIN/URI
            if (itemId === item.generated_internal_id && detailedData.generated_unique_award_id && detailedData.generated_unique_award_id.trim() !== '') {
                 console.log(`Updating itemId for ${itemId} to more specific ID from detail endpoint: ${detailedData.generated_unique_award_id}`);
                 itemId = detailedData.generated_unique_award_id;
            } else if (itemId === item.generated_internal_id && detailedData.piid && detailedData.piid.trim() !== '') {
                 console.log(`Updating itemId for ${itemId} to PIID from detail endpoint: ${detailedData.piid}`);
                 itemId = detailedData.piid;
            } else if (itemId === item.generated_internal_id && detailedData.fain && detailedData.fain.trim() !== '') {
                 console.log(`Updating itemId for ${itemId} to FAIN from detail endpoint: ${detailedData.fain}`);
                 itemId = detailedData.fain;
            } else if (itemId === item.generated_internal_id && detailedData.uri && detailedData.uri.trim() !== '') {
                console.log(`Updating itemId for ${itemId} to URI from detail endpoint: ${detailedData.uri}`);
                itemId = detailedData.uri;
            }


          } else {
            console.error(`Failed to fetch details for ID ${itemId}. Status: ${detailResponse.status}, Text: ${await detailResponse.text().catch(() => '')}`);
          }
        } catch (detailError) {
          console.error(`Error fetching or processing detail for ID ${itemId}: ${detailError instanceof Error ? detailError.message : String(detailError)}`);
        }
      }
      
      const effectiveTypeString = currentTypeDescription || currentAwardType;
      const originalNameFromApi = currentRecipientName || 'Unknown Recipient';
      const nameForPlaceholder = `Award (Recipient: ${currentRecipientName || 'N/A'}, Type: ${effectiveTypeString || 'N/A'}): ${itemId}`;

      // Determine initial name and description based on API data
      let nameToRefine: string = originalNameFromApi;
      if (currentRecipientName === null || currentRecipientName === undefined || currentRecipientName.trim() === '' || currentRecipientName.toUpperCase() === 'MULTIPLE RECIPIENTS') {
        const effectiveTypeUpper = effectiveTypeString?.toUpperCase();
        const isMultipleRecipients = currentRecipientName?.toUpperCase() === 'MULTIPLE RECIPIENTS';

        if (isMultipleRecipients || (effectiveTypeUpper && (effectiveTypeUpper.includes('IDV') || effectiveTypeUpper.includes('INDEFINITE DELIVERY') || effectiveTypeUpper.includes('VEHICLE')))) {
          let baseName = isMultipleRecipients ? "Multiple Recipients" : (effectiveTypeString || "IDV-like Award");
          nameToRefine = `${baseName} (${itemId})`;
          console.warn(`Recipient name is '${currentRecipientName || 'null/empty'}' for award ID: ${itemId}, Type: ${effectiveTypeString || 'N/A'}. Using '${nameToRefine}' for AI refinement.`);
        } else if (!effectiveTypeString) { // If type is also missing, use the generic placeholder
            nameToRefine = nameForPlaceholder;
            console.warn(`Recipient name AND type are missing/unclear for award ID: ${itemId}. Using placeholder '${nameToRefine}' for AI refinement.`);
        }
      } else if (!currentRecipientName) { // Should not happen if previous checks are correct, but as a fallback
        nameToRefine = `Award ID: ${itemId}`;
      }


      // Filter out items with Disaster Emergency Fund Codes (DEFC) as these are non-discretionary
      if (item.disaster_emergency_fund_codes && item.disaster_emergency_fund_codes.length > 0) {
        console.log(`Skipping item ${itemId} as it has DEFC codes (non-discretionary): ${item.disaster_emergency_fund_codes.join(', ')}`);
        continue;
      }

      // --- AI Refinement Step ---
      let refinedName = nameToRefine; // Fallback to original/derived name
      let refinedDescription = currentDescription || "No description provided."; // Fallback
      let suggestedCategory: string | undefined = undefined;

      // Construct a more informative input for the AI, even with N/A values
      const originalApiName = item.recipient_name || "N/A";
      const originalApiType = effectiveTypeString || "N/A";
      const originalApiDescription = currentDescription || "N/A";

      let promptForAI = `Given the following federal award data:
        Award ID: "${itemId}"
        Original Recipient/Name from API: "${originalApiName}"
        Original Award Type from API: "${originalApiType}"
        Original Description from API: "${originalApiDescription}"
        Obligation Amount: $${obligationAmount ? obligationAmount.toLocaleString() : 'Not specified'}

        Your Task:
        1. Refined Program Name: Create a concise, citizen-friendly program name.
           - If the original recipient/name and type are specific (e.g., "Lockheed Martin" for "F-35 Program"), adapt or use that.
           - If the original recipient/name or type is generic (e.g., "Multiple Recipients", "Unknown Recipient", "N/A", or a generic contract type), infer a plausible, more descriptive program name or a general category of expenditure based on the obligation amount and any available description. For example, instead of "Award (Recipient: N/A, Type: N/A): XYZ", try "Major Federal Project (ID: XYZ)" or "General Government Services Contract (ID: XYZ)". If the description offers clues, use them.
           - The goal is a name that sounds like a distinct budget item a citizen could understand.
        2. Refined Description: Write a brief (1-2 sentences) explanation of what this program or award is likely for, in simple terms.
           - If the original description is good, summarize or adapt it.
           - If the original description is generic or "N/A", infer a plausible purpose based on the refined name, amount, and any other clues.
        3. Suggested Category: Suggest a high-level category (e.g., Defense, Education, Healthcare, Infrastructure, Research, General Government, Other). Prioritize based on any available information.

        Output Format: Follow the Zod schema for 'refinedName', 'refinedDescription', and 'suggestedCategory'.
        Example for a vague, large award: { refinedName: "National Research Initiative Grant", refinedDescription: "A significant grant supporting various unspecified national research projects.", suggestedCategory: "Research" }
        Example for a specific award: { refinedName: "F-35 Lightning II Sustainment", refinedDescription: "Provides ongoing maintenance, upgrades, and support for the F-35 fighter jet program.", suggestedCategory: "Defense" }`;
      
      // Add more specific guidance if data is very sparse
      if (originalApiName === "N/A" && originalApiType === "N/A" && originalApiDescription === "N/A") {
        promptForAI += `

Note: All key textual fields (recipient, type, description) from the API are N/A. Please generate the most plausible program name, description, and category for an award of this magnitude ($${obligationAmount ? obligationAmount.toLocaleString() : 'Not specified'}). Think about common large-scale federal spending areas.`;
      } else if (originalApiName === "N/A" && originalApiType === "N/A") {
        promptForAI += `

Note: Recipient and type are N/A. Use the original description ("${originalApiDescription}") and amount ($${obligationAmount ? obligationAmount.toLocaleString() : 'Not specified'}) to infer a plausible program name, description, and category.`;
      }


      try {
        console.log(`Attempting AI refinement for: ${itemId} (${nameToRefine})`);
        const { object: aiOutput } = await generateObject({
          model: getModel(), // Ensure getModel() is correctly configured
          schema: ProgramDetailsSchema,
          prompt: promptForAI,
        });
        refinedName = aiOutput.refinedName;
        refinedDescription = aiOutput.refinedDescription;
        suggestedCategory = aiOutput.suggestedCategory;
        console.log(`AI Refinement successful for ${itemId}: New Name='${refinedName}', Category='${suggestedCategory || 'N/A'}'`);
      } catch (aiError: any) { // Catch as any or unknown then type check
        console.error(`AI refinement failed for item ID ${itemId} (${nameToRefine}).`);
        if (aiError instanceof Error) {
            console.error(`AI Error Message: ${aiError.message}`);
            if (aiError.stack) {
                console.error(`AI Error Stack: ${aiError.stack}`);
            }
            // Check for the specific error message pattern
            if (aiError.message && 
                aiError.message.includes("is not found for API version") && 
                aiError.message.includes("Call ListModels")) {
                console.log("\nSpecific AI model error detected. Attempting to list available Google models...");
                await logAvailableGoogleModels(); // Call the new utility
            }
        } else {
            console.error('AI Error object (not an Error instance):', aiError);
        }
        console.error('Terminating script due to AI refinement error to save credits.');
        process.exit(1); 
      }
      // --- End AI Refinement Step ---


      const now = new Date().toISOString();
      const wishingWellItem: WishingWellItem = {
        id: itemId,
        userId: USER_ID_PLACEHOLDER,
        name: refinedName,
        description: refinedDescription,
        content: currentDescription, // Store original API description in content for reference
        images: null,
        featuredImage: null,
        createdAt: now,
        updatedAt: now,
        averageAllocation: item.obligation ? String(item.obligation) : null,
        embedding: null,
        originalName: nameToRefine, // Store the name used for AI input
        originalDescription: currentDescription,
        programType: suggestedCategory || effectiveTypeString, // Use AI category or fallback to API type
      };
      wishingWellItems.push(wishingWellItem);
    } // End of for...of loop

    return wishingWellItems;
  } catch (error) {
    console.error('Failed to fetch or process data. Script will terminate.');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } else {
      console.error('Caught non-Error object:', error);
    }
    // Include additional debugging info if available, e.g., requestBody
    console.error('Request body for fetch:', JSON.stringify(requestBody, null, 2));
    process.exit(1);
  }
}

async function saveWishingWellData(data: WishingWellItem[]) {
  try {
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`Successfully saved ${data.length} items to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Failed to save data to file. Script will terminate.');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } else {
      console.error('Caught non-Error object:', error);
    }
    process.exit(1);
  }
}

async function main() {
  const federalPrograms = await fetchFederalPrograms();
  await saveWishingWellData(federalPrograms);
}

main();