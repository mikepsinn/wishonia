import dotenv from 'dotenv';
dotenv.config(); // Load .env file into process.env

import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateObject } from 'ai';
import { getModel, ModelName } from '@/lib/utils/modelUtils';
import { z } from 'zod';

const DEFAULT_AI_MODEL = 'gemini-2.5-pro-preview-05-06' as ModelName;
// Default to dry run unless CREATE_ISSUES is true
const CREATE_ISSUES_FLAG = process.env.CREATE_ISSUES === 'true';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'mikepsinn';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'wishonia';

if (!GITHUB_TOKEN) {
  throw new Error(
    'GITHUB_TOKEN environment variable is required.\n' +
    'Generate a token at: https://github.com/settings/tokens/new?scopes=repo,workflow\n' +
    'Required scopes: repo (for private repos), workflow (for GitHub Actions).'
  );
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

interface RoadmapItem {
  title: string;
  status: 'open' | 'closed'; // 'open' for unchecked, 'closed' for checked
  lineNumber: number;
  rawText: string;
}

// Helper function to generate a random hex color (without #)
function generateRandomHexColor(): string {
  return Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// Zod Schemas for GitHub Issue Data
const GitHubLabelSchema = z.object({
  name: z.string().describe("Name of the GitHub label. This is always required."),
  color: z.string().optional().describe("Hex color code for the label (e.g., 'f29513'), without the #. Provide if suggesting a NEW label, otherwise omit to use existing label's color."),
  description: z.string().optional().describe("Description of the label. Provide if suggesting a NEW label, otherwise omit.")
});
type GitHubLabel = z.infer<typeof GitHubLabelSchema>;

const GitHubMilestoneSchema = z.object({
  title: z.string().describe("Title of the GitHub milestone. This is always required."),
  description: z.string().optional().describe("Description of the milestone. Provide if suggesting a NEW milestone, otherwise omit."),
  due_on: z.string().optional().describe("The due date of the milestone in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ). Provide if suggesting a NEW milestone, otherwise omit.")
});
type GitHubMilestone = z.infer<typeof GitHubMilestoneSchema>;

const IssueCreationDataSchema = z.object({
  originalRoadmapTitle: z.string().describe("The exact title of the roadmap item this issue corresponds to. This MUST be identical to the input roadmap item title."),
  title: z.string().describe("A concise, descriptive title for the GitHub issue. This can be a refined version of the roadmap item."),
  body: z.string().describe("A detailed description of the issue. Include an assessment of the current status (Not Started, Partially Implemented, Implemented, Needs Review), evidence from the codebase (if any), and a plan or next steps. Reference the original roadmap item text if helpful."),
  labels: z.array(GitHubLabelSchema).describe("An array of GitHub label objects to apply to the issue. Prefer existing labels if suitable. If suggesting a new label, provide its name, and optionally color and description."),
  milestoneTitle: z.string().optional().describe("The title of an existing or new GitHub milestone to associate this issue with. If suggesting a new milestone, also provide its description and optional due_on date if appropriate via the milestone object structure."),
  suggestedSubTasks: z.array(z.string()).optional().describe("If the roadmap item is complex, suggest a list of sub-task titles that could be broken down into separate smaller issues or a checklist within this issue."),
  relevantFilePaths: z.array(z.string()).optional().describe("A list of file paths relevant to this roadmap item, if any.")
});
type IssueCreationData = z.infer<typeof IssueCreationDataSchema>;

// New schema for batch AI output
const BatchIssueCreationOutputSchema = z.object({
  issues: z.array(IssueCreationDataSchema).describe("An array of GitHub issue creation data objects, one for each roadmap item processed.")
});
type BatchIssueCreationOutput = z.infer<typeof BatchIssueCreationOutputSchema>;

function parseRoadmap(): RoadmapItem[] {
  const roadmapPath = path.join(process.cwd(), 'public/docs/roadmap.md');
  console.log(`[Debug] Roadmap path: ${roadmapPath}`);
  if (!fs.existsSync(roadmapPath)) {
    console.error('[Debug] Roadmap file does not exist at path.');
    return [];
  }
  const content = fs.readFileSync(roadmapPath, 'utf-8');
  console.log(`[Debug] Roadmap content (first 200 chars): ${content.substring(0, 200)}`);
  
  const items: RoadmapItem[] = [];
  // Regex:
  // - `-\s+`: Hyphen followed by one or more whitespace characters.
  // - `\[( |x)\]`: Checkbox part: `[` then space or `x` then `]`. (Captures space or x)
  // - `\s*`: Zero or more whitespace characters.
  // - `\*\*`: Literal `**`.
  // - `(.+?)`: Capture group 2: The title (non-greedy).
  // - `\*\*`: Literal `**`.
  // - `gm`: Global (all matches) and Multiline (processes line by line with exec).
  const regex = /-\s+\[( |x)\]\s*\*\*(.+?)\*\*/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    // match[0] is the full matched string
    // match[1] is the content of the first capture group (the ' ' or 'x' in the checkbox)
    // match[2] is the content of the second capture group (the title)
    const checked = match[1].trim() === 'x';
    const title = match[2].trim();
    items.push({ title, status: checked ? 'closed' : 'open', lineNumber: match.index, rawText: match[0] });
  }
  
  console.log(`[Debug] Regex exec loop found: ${items.length} items.`);

  if (items.length === 0) {
    console.warn("[Debug] No roadmap items extracted. Check regex and roadmap format. Regex used:", regex.source);
  }

  return items;
}

function getFileTree(): string {
  try {
    // Added -I to ignore node_modules and .git, common large directories
    return execSync('tree -L 3 -I "node_modules|.git|.next|public|build|dist" -J .', { encoding: 'utf-8' });
  } catch {
    console.warn("[Debug] Tree command failed or not available. File tree evidence will be empty.");
    return '';
  }
}

function getReadme(): string {
  const readmePath = path.join(process.cwd(), 'README.md');
  return fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : '';
}

function getPackageScripts(): string {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) return '';
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return JSON.stringify(pkg.scripts, null, 2);
  } catch {
    return '';
  }
}

// function getTestFile(): string { // Commented out as not used
//   const testPath = path.join(process.cwd(), 'tests/ai/generate-object.test.ts');
//   return fs.existsSync(testPath) ? fs.readFileSync(testPath, 'utf-8') : '';
// }

async function getExistingLabelsAndMilestones(): Promise<{ labels: GitHubLabel[], milestones: GitHubMilestone[] }> {
  const existingData: { labels: GitHubLabel[], milestones: GitHubMilestone[] } = { labels: [], milestones: [] };
  try {
    const [labelsRes, milestonesRes] = await Promise.all([
      octokit.paginate(octokit.issues.listLabelsForRepo, {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        per_page: 100,
      }),
      octokit.paginate(octokit.issues.listMilestones, {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        state: 'all', // Fetch all to know about existing ones, though we'll prefer open for assignment
        per_page: 100,
      })
    ]);
    existingData.labels = labelsRes.map(label => ({
      name: label.name,
      color: label.color,
      description: label.description || undefined,
    }));
    existingData.milestones = milestonesRes.map(milestone => ({
      title: milestone.title,
      description: milestone.description || undefined,
      due_on: milestone.due_on || undefined,
    }));
  } catch (error) {
    console.warn("Could not fetch existing labels and milestones:", error);
    // Proceed without them if there's an error
  }
  return existingData;
}

async function getAllIssues(): Promise<{ [title: string]: any }> {
  const issues: { [title: string]: any } = {};
  let page = 1;
  let done = false;
  while (!done) {
    const res = await octokit.issues.listForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      state: 'all', // Fetch both open and closed issues
      per_page: 100,
      page,
    });
    res.data.forEach(issue => {
      if (issue.title) issues[issue.title] = issue;
    });
    if (res.data.length < 100) done = true;
    else page++;
  }
  return issues;
}

async function aiAssessRoadmapBatch(
  fullRoadmapContent: string,
  codeEvidence: string,
  existingLabels: GitHubLabel[],
  existingMilestones: GitHubMilestone[]
): Promise<BatchIssueCreationOutput> {
  const model = getModel(DEFAULT_AI_MODEL);

  const prompt = `
You are an expert project manager and software engineer. Your task is to process roadmap items for the Wishonia project and generate detailed GitHub issue specifications for each.

**Context:**
*   **Project Goal:** Wishonia aims to be a crowdfunding platform for achieving a Utilitarian Paretopia.
*   **Full Roadmap Content (Parse items matching the pattern '- [ ] **Title**' or '- [x] **Title**'):**
    \`\`\`markdown
    ${fullRoadmapContent}
    \`\`\`
*   **Codebase Evidence (Includes file tree, README, package.json scripts, and prisma.schema):**
    \`\`\`
    ${codeEvidence}
    \`\`\`
*   **Existing GitHub Labels:**
    ${JSON.stringify(existingLabels, null, 2)}
*   **Existing GitHub Milestones:**
    ${JSON.stringify(existingMilestones, null, 2)}

**Instructions for EACH roadmap item you identify in the Full Roadmap Content:**

1.  **Original Roadmap Title:** You MUST extract and include the exact 'originalRoadmapTitle' as it appears between the asterisks in the roadmap. This is critical for matching.
2.  **Refined Issue Title:** Create a concise, descriptive GitHub issue title.
3.  **Detailed Body:**
    *   State the item's **current implementation status** (e.g., Not Started, Partially Implemented, Fully Implemented, Needs Review) based on the roadmap's checkbox status (\`[ ]\` vs \`[x]\`) and your analysis of the evidence (including the prisma.schema for data model tasks).
    *   Provide a brief **assessment**, citing evidence from the codebase if applicable.
    *   Outline a **plan or next steps**.
4.  **Labels:**
    *   Suggest appropriate labels.
    *   **Crucially, if an existing label (name, color, description) is suitable, use its exact existing name and OMIT its color and description in your output for that label to avoid trying to re-create/update it.**
    *   If suggesting a COMPLETELY NEW label, provide its name, and optionally a hex color (no '#') and a description.
    *   Include a 'type' label (e.g., type:development, type:documentation, type:research, type:community).
    *   Include a 'phase' label corresponding to its roadmap phase (e.g., phase:0, phase:1, phase:1.5) if discernible.
5.  **Milestone:**
    *   Suggest an appropriate GitHub milestone title.
    *   **If an existing milestone title is suitable, use its exact title.**
    *   If suggesting a COMPLETELY NEW milestone, provide its title, and optionally a description and a due_on date (YYYY-MM-DDTHH:MM:SSZ).
6.  **Sub-Tasks:** If the item is complex, break it down into a list of suggested sub-task titles.
7.  **Relevant Files:** List any relevant file paths from the codebase evidence (e.g. README.md, package.json, prisma/schema.prisma, specific script files).

Process ALL roadmap items you identify and provide your output as a single JSON object conforming to the BatchIssueCreationOutputSchema.
The output array of issues should contain one entry for each roadmap item identified.
`;

  console.log(`🤖 Calling AI to assess roadmap items from content in a batch...`);
  try {
    const result = await generateObject({
      model,
      schema: BatchIssueCreationOutputSchema,
      prompt,
      mode: "json",
      temperature: 0.2, // Lower temperature for more deterministic output
    });
    console.log(`✅ AI batch assessment complete. Received ${result.object.issues.length} issue specifications from AI parsing.`);
    return result.object;
  } catch (error) {
    console.error("Error during AI batch assessment:", error);
    throw error;
  }
}

async function main() {
  const items = parseRoadmap();
  if (!items.length) {
    console.log('No roadmap items found by local parsing. Exiting.');
    return;
  }
  const roadmapContent = fs.readFileSync(path.join(process.cwd(), 'public/docs/roadmap.md'), 'utf-8');
  const fileTree = getFileTree();
  const readme = getReadme();
  const scripts = getPackageScripts();
  const prismaSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const prismaSchemaContent = fs.existsSync(prismaSchemaPath) ? fs.readFileSync(prismaSchemaPath, 'utf-8') : 'prisma/schema.prisma not found.';
  
  const evidence = `FILE TREE:\n${fileTree}\n\nREADME.md:\n${readme}\n\npackage.json scripts:\n${scripts}\n\nprisma/schema.prisma:\n${prismaSchemaContent}\n`;

  let { labels: existingLabels, milestones: existingMilestones } = await getExistingLabelsAndMilestones();
  const existingIssuesByTitle = await getAllIssues(); // Renamed from existingIssues for clarity
  
  console.log(CREATE_ISSUES_FLAG ? "\n--- STARTING LIVE RUN (CREATE_ISSUES=true) ---" : "\n--- STARTING DRY RUN (to execute live, set CREATE_ISSUES=true) ---");

  // Call the batch assessment function
  const aiBatchResult = await aiAssessRoadmapBatch(roadmapContent, evidence, existingLabels, existingMilestones);
  const aiGeneratedIssuesData = aiBatchResult.issues;

  console.log(`[Info] Local parser found ${items.length} roadmap items. AI parser returned ${aiGeneratedIssuesData.length} issue specifications.`);
  if (aiGeneratedIssuesData.length !== items.length) {
    console.warn(
        `[Mismatch Warning] Number of items from local parsing (${items.length}) differs from AI output (${aiGeneratedIssuesData.length}). This may lead to incomplete processing or errors in matching. Review AI output and roadmap parsing logic.`
    );
    // Consider if we should halt or how to best reconcile. For now, will proceed matching what we can.
  }

  // Store processed titles to avoid duplicate operations if AI returns multiple entries for the same original title
  const processedOriginalTitles = new Set<string>(); 

  for (const aiIssueData of aiGeneratedIssuesData) {
    const originalRoadmapTitle = aiIssueData.originalRoadmapTitle;

    if (processedOriginalTitles.has(originalRoadmapTitle)) {
        console.warn(`[Skipping] Already processed AI data for original roadmap title: "${originalRoadmapTitle}". This might indicate the AI returned duplicates for the same input item.`);
        continue;
    }
    processedOriginalTitles.add(originalRoadmapTitle);

    // Find the original roadmap item that corresponds to this AI-generated data.
    // This relies on the AI correctly returning the originalRoadmapTitle.
    const roadmapItem = items.find(item => item.title === originalRoadmapTitle);

    if (!roadmapItem) {
      console.warn(`[Critical Error] AI returned data for an unknown original roadmap title: "${originalRoadmapTitle}". Skipping this AI data. This indicates a mismatch or hallucination by the AI.`);
      continue;
    }
    
    // The rest of the loop will use `aiIssueData` and the matched `roadmapItem`
    // This part needs to be filled in with the logic from the old loop, adapted for `aiIssueData`

    const issueTitleFromAI = aiIssueData.title;
    const issueBodyFromAI = aiIssueData.body;
    const suggestedLabelsFromAI = aiIssueData.labels; // Array of GitHubLabel objects
    const suggestedMilestoneFromAI = aiIssueData.milestoneTitle ? 
      { title: aiIssueData.milestoneTitle } as Partial<GitHubMilestone> : // Reconstruct to match expected structure
      undefined; 
    // Note: If new milestones need description/due_on, the AI prompt and schema need to support returning a full milestone object
    // For now, assuming it mostly suggests existing or simple new milestone titles via `milestoneTitle`
    // And new label suggestions include color/description directly in `suggestedLabelsFromAI`

    const suggestedSubTasks = aiIssueData.suggestedSubTasks || [];
    const relevantFilePaths = aiIssueData.relevantFilePaths || [];

    console.log(`\nProcessing Roadmap Item: "${roadmapItem.title}" (Line: ${roadmapItem.lineNumber})`);
    console.log(`AI Refined Title: "${issueTitleFromAI}"`);

    let finalIssueBody = issueBodyFromAI;
    if (suggestedSubTasks.length > 0) {
      finalIssueBody += "\n\n### Suggested Sub-tasks:\n";
      suggestedSubTasks.forEach(task => {
        finalIssueBody += `- [ ] ${task}\n`;
      });
    }
    if (relevantFilePaths.length > 0) {
      finalIssueBody += "\n\n### Relevant Files:\n";
      relevantFilePaths.forEach(filePath => {
        finalIssueBody += `- \`${filePath}\`\n`;
      });
    }

    // Try to find an existing issue by the original roadmap title first, then by AI refined title
    let existingIssue = existingIssuesByTitle[roadmapItem.title] || existingIssuesByTitle[issueTitleFromAI];
    
    // ... (The rest of the logic for creating/updating labels, milestones, and issues will go here)
    // This includes handling existingIssue, creating/updating labels, milestones, and the issue itself.
    // It will be very similar to the previous loop's content but using aiIssueData.

    // Placeholder for the rest of the issue processing logic:
    console.log(`DRY RUN: (Simulating GitHub operations for "${issueTitleFromAI}")`);
    console.log(`DRY RUN: Body:\n${finalIssueBody.substring(0, 200)}...`);
    console.log(`DRY RUN: Labels: ${suggestedLabelsFromAI.map(l => l.name).join(', ')}`);
    if (suggestedMilestoneFromAI) {
        console.log(`DRY RUN: Suggested Milestone Title: ${suggestedMilestoneFromAI.title}`);
    }
    console.log(`DRY RUN: Desired State (from roadmap): ${roadmapItem.status}`);


    // Ensure we update existingLabels and existingMilestones if new ones are created (even in dry run for consistency in the loop)
    for (const labelSuggestion of suggestedLabelsFromAI) {
        const existingLabel = existingLabels.find(l => l.name.toLowerCase() === labelSuggestion.name.toLowerCase());
        if (!existingLabel && labelSuggestion.name) { // If it's a new label suggestion
            const newLabelForSim: GitHubLabel = {
                name: labelSuggestion.name,
                color: labelSuggestion.color || generateRandomHexColor().substring(1), // Use AI color or random
                description: labelSuggestion.description || `AI Suggested Label: ${labelSuggestion.name}`
            };
            if (CREATE_ISSUES_FLAG) {
                // Actual GitHub label creation logic would go here
                // For now, just add to our simulation list
                // const createdLabel = await octokit.issues.createLabel(...); existingLabels.push(createdLabel.data);
            }
            existingLabels.push(newLabelForSim); // Simulate addition for subsequent items in this run
            console.log(`DRY RUN: Would create new label "${newLabelForSim.name}" (Color: ${newLabelForSim.color}, Desc: ${newLabelForSim.description})`);
        }
    }

    if (suggestedMilestoneFromAI?.title) {
        const milestoneTitle = suggestedMilestoneFromAI.title;
        const existingMilestone = existingMilestones.find(m => m.title.toLowerCase() === milestoneTitle.toLowerCase());
        if (!existingMilestone) {
            // AI suggested a new milestone
            const newMilestoneForSim: GitHubMilestone = {
                title: milestoneTitle,
                description: aiIssueData.milestoneTitle, // Assuming the schema/prompt needs to be richer if full details are needed here
                due_on: undefined // Same as above
            };
             if (CREATE_ISSUES_FLAG) {
                // Actual GitHub milestone creation logic
                // const createdMilestone = await octokit.issues.createMilestone(...); existingMilestones.push(createdMilestone.data);
            }
            existingMilestones.push(newMilestoneForSim); // Simulate addition
            console.log(`DRY RUN: Would create new milestone "${newMilestoneForSim.title}" (Desc: ${newMilestoneForSim.description}, Due: ${newMilestoneForSim.due_on})`);
        }
    }


     // GitHub Issue Creation/Update Logic (adapted from previous loop)
    const targetLabels = suggestedLabelsFromAI.map(l => l.name); // Get just the names for the issue
    let milestoneId: number | undefined = undefined;

    if (suggestedMilestoneFromAI?.title) {
        const ms = existingMilestones.find(m => m.title.toLowerCase() === suggestedMilestoneFromAI.title!.toLowerCase());
        // In a real run, if 'ms' is undefined here and it was a new suggestion, we'd have created it above and fetched its ID.
        // For dry run, we're just noting the title.
        // milestoneId = ms?.number; // In real run, use ms.number if it exists or was just created.
        console.log(`DRY RUN: Milestone to be associated (by title): ${suggestedMilestoneFromAI.title}`);
    }
    
    if (existingIssue) {
      // Update existing issue
      console.log(`DRY RUN: Would update existing issue #${existingIssue.number} ("${existingIssue.title}")`);
      console.log(`DRY RUN: New Title: "${issueTitleFromAI}"`);
      // ... (update logic)
      if (roadmapItem.status === "closed" && existingIssue.state === "open") {
        console.log(`DRY RUN: Would close issue #${existingIssue.number}.`);
      } else if (roadmapItem.status === "open" && existingIssue.state === "closed") {
        console.log(`DRY RUN: Would reopen issue #${existingIssue.number}.`);
      }
    } else {
      // Create new issue
      console.log(`DRY RUN: Would create issue with Title: "${issueTitleFromAI}"`);
      // ... (creation logic)
      if (roadmapItem.status === "closed") {
         console.log(`DRY RUN: Would close issue #${existingIssue.number}.`);
      } else if (roadmapItem.status === "open" && existingIssue.state === "closed") {
        console.log(`DRY RUN: Would reopen issue #${existingIssue.number}.`);
      }
    }
  }
}

main();
