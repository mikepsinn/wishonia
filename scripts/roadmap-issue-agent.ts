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
// function generateRandomHexColor(): string { // No longer needed if AI doesn't suggest new label colors
//   return Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
// }

// Zod Schemas for GitHub Issue Data
const GitHubLabelSchema = z.object({ // This schema is still useful for getExistingLabelsAndMilestones
  name: z.string().describe("Name of the GitHub label. This is always required."),
  color: z.string().optional().describe("Hex color code for the label (e.g., 'f29513'), without the #."),
  description: z.string().optional().describe("Description of the label.")
});
type GitHubLabel = z.infer<typeof GitHubLabelSchema>;

const GitHubMilestoneSchema = z.object({
  title: z.string().describe("Title of the GitHub milestone. This is always required."),
  description: z.string().optional().describe("Description of the milestone. Provide if suggesting a NEW milestone, otherwise omit."),
  due_on: z.string().optional().describe("The due date of the milestone in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ). Provide if suggesting a NEW milestone, otherwise omit.")
});
type GitHubMilestone = z.infer<typeof GitHubMilestoneSchema>;

const PREDEFINED_ALLOWED_LABELS = [
  // Phase Labels
  "phase:0", "phase:1", "phase:2", "phase:3", "phase:4", "phase:paretotopia",
  // Type Labels
  "type:development", "type:documentation", "type:research", "type:planning",
  "type:design", "type:refactor", "type:testing", "type:community",
  "type:operational", "type:content", "type:legal", "type:funding",
  "type:data-modeling", "type:ai-agent",
  // Practical/Status/Priority/Kind Labels
  "priority:high", "priority:medium", "priority:low",
  "status:needs-triage", "status:ready-for-dev", "status:in-progress",
  "status:needs-review", "status:blocked",
  "good first issue", "help wanted",
  "effort:small", "effort:medium", "effort:large",
  "kind:bug", "kind:enhancement", "kind:question",
  "blocker", "needs-discussion"
] as const; // Important for z.enum

const IssueCreationDataSchema = z.object({
  originalRoadmapTitle: z.string().describe("The exact title of the roadmap item this issue corresponds to. This MUST be identical to the input roadmap item title."),
  originalRoadmapItemStatus: z.enum(['open', 'closed']).describe("The status ('open' or 'closed') of the original roadmap item, based DIRECTLY on AI's parsing of the roadmap checkbox ('[ ]' for open, '[x]' for closed). This is CRITICAL for logic."),
  title: z.string().describe("A concise, descriptive title for the GitHub issue. This can be a refined version of the roadmap item."),
  body: z.string().describe("A detailed description of the issue. Include an assessment of the current status (Not Started, Partially Implemented, Implemented, Needs Review) based on analysis of the evidence, and a plan or next steps. Reference the original roadmap item text if helpful."),
  labels: z.array(z.enum(PREDEFINED_ALLOWED_LABELS))
    .describe("An array of GitHub label NAMES selected EXCLUSIVELY from the PREDEFINED_ALLOWED_LABELS list. Choose all that apply."),
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
  existingLabels: GitHubLabel[], // Still useful to show AI what's already on GitHub
  existingMilestones: GitHubMilestone[]
): Promise<BatchIssueCreationOutput> {
  const model = getModel(DEFAULT_AI_MODEL);

  // const standardTypeLabels = [ // No longer needed as separate list, merged into PREDEFINED_ALLOWED_LABELS
  // ];

  const roadmapPhaseTitles = [ // Still useful for guiding milestone title suggestions
    "Phase 0: Inception",
    "Phase 1: Foundation",
    "Phase 2: Internal Gift Economy",
    "Phase 3: Fair Tax & UBI",
    "Phase 4: Sustainability, Governance & Advanced AI",
    "Phase X: Paretotopia"
  ];

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
*   **Existing GitHub Labels (Names, Colors, Descriptions):**
    ${JSON.stringify(existingLabels, null, 2)}
*   **Existing GitHub Milestones (Titles, Descriptions, Due Dates):**
    ${JSON.stringify(existingMilestones, null, 2)}
*   **PREDEFINED ALLOWED LABELS (You MUST choose from this list for the 'labels' field):**
    ${JSON.stringify(PREDEFINED_ALLOWED_LABELS, null, 2)}
*   **Roadmap Phase Titles (Use these for Milestone title suggestions):**
    ${JSON.stringify(roadmapPhaseTitles, null, 2)}

**Instructions for EACH roadmap item you identify in the Full Roadmap Content:**

1.  **Original Roadmap Title:** You MUST extract and include the exact 'originalRoadmapTitle' as it appears between the asterisks in the roadmap. This is critical for matching.
2.  **Original Roadmap Item Status:** You MUST determine and include the 'originalRoadmapItemStatus'. This should be 'open' if the roadmap item has a '[ ]' checkbox and 'closed' if it has a '[x]' checkbox. This field is CRITICAL.
3.  **Refined Issue Title:** Create a concise, descriptive GitHub issue title.
4.  **Detailed Body:**
    *   State the item's **current implementation status** (e.g., Not Started, Partially Implemented, Fully Implemented, Needs Review) based on your analysis of the evidence (including the prisma.schema for data model tasks). This is separate from the direct checkbox status.
    *   Provide a brief **assessment**, citing evidence from the codebase if applicable.
    *   Outline a **plan or next steps**.
5.  **Labels (Array of strings):**
    *   You MUST select ALL relevant label names for the issue EXCLUSIVELY from the "PREDEFINED ALLOWED LABELS" list provided above.
    *   Ensure you include at least one 'type:X' label and one 'phase:X' label.
    *   Also include any relevant 'priority:X', 'status:X', 'effort:X', 'kind:X', 'good first issue', 'blocker', etc., labels from the predefined list.
    *   Do NOT invent new labels. Do NOT provide color or description for labels.
6.  **Milestone:**
    *   Suggest an appropriate GitHub milestone title. **This title SHOULD generally be one of the "Roadmap Phase Titles" provided in the context.**
    *   If an existing milestone on GitHub matches one of these Roadmap Phase Titles, use its exact title.
    *   If suggesting a new milestone (e.g., if one of the Roadmap Phase Titles isn't yet a milestone on GitHub), provide its title. For description, you can use the phase title again. Due dates are optional.
7.  **Sub-Tasks:** If the item is complex, break it down into a list of suggested sub-task titles.
8.  **Relevant Files:** List any relevant file paths from the codebase evidence (e.g. README.md, package.json, prisma/schema.prisma, specific script files).

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
    
    const issueTitleFromAI = aiIssueData.title;
    const issueBodyFromAI = aiIssueData.body;
    // Labels are now just an array of strings (names) from the predefined list
    const suggestedLabelNamesFromAI = aiIssueData.labels; 
    const suggestedMilestoneFromAI = aiIssueData.milestoneTitle ? 
      { title: aiIssueData.milestoneTitle } as Partial<GitHubMilestone> : 
      undefined; 

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
    
    // GitHub Issue Creation/Update Logic
    // targetLabels is now directly suggestedLabelNamesFromAI
    // let milestoneIdForGitHub: number | undefined = undefined; // Keep for potential future use with actual API

    if (suggestedMilestoneFromAI?.title) {
        const ms = existingMilestones.find(m => m.title.toLowerCase() === suggestedMilestoneFromAI.title!.toLowerCase());
        // milestoneIdForGitHub = ms?.id; // Or ms.number
        console.log(`DRY RUN: Milestone to be associated (by title): ${suggestedMilestoneFromAI.title}`);
    }
    
    const desiredStatusFromAI = aiIssueData.originalRoadmapItemStatus; 

    // --- REMOVE SIMULATION OF CREATING NEW LABELS ---
    // The old block for iterating suggestedLabelsFromAI and simulating new label creation is removed.
    // We now assume all labels in suggestedLabelNamesFromAI are from the predefined list
    // and should exist on GitHub or be created manually in a one-time setup.

    console.log(`DRY RUN: (Simulating GitHub operations for "${issueTitleFromAI}")`);
    console.log(`DRY RUN: Body (first 200 chars):\n${finalIssueBody.substring(0, 200)}...`);
    console.log(`DRY RUN: Labels to apply: ${suggestedLabelNamesFromAI.join(', ')}`);
    if (suggestedMilestoneFromAI?.title) {
      const existingMilestone = existingMilestones.find(m => m.title.toLowerCase() === suggestedMilestoneFromAI.title!.toLowerCase());
      if (!existingMilestone && CREATE_ISSUES_FLAG) {
          // In a real run, we might create the milestone here if it's from roadmapPhaseTitles but doesn't exist
          // For now, dry run assumes it exists or would be picked up by title.
          console.log(`DRY RUN: Milestone "${suggestedMilestoneFromAI.title}" does not exist. In a live run, it might be created if it's a defined roadmap phase.`);
      } else if (!existingMilestone) {
          console.log(`DRY RUN: Milestone "${suggestedMilestoneFromAI.title}" does not exist.`);
      }
    }
    // --- END OF REMOVED/SIMPLIFIED LABEL/MILESTONE CREATION SIMULATION ---


    if (existingIssue) {
      // Issue EXISTS on GitHub
      console.log(`DRY RUN: Existing issue found: #${existingIssue.number} ("${existingIssue.title}"), Current state: ${existingIssue.state}`);
      
      // TODO: Add logic to update title, body, labels, milestone if they differ significantly
      // Example: if (existingIssue.title !== issueTitleFromAI || /* other conditions */ ) {
      //   console.log(`DRY RUN: Would update issue #${existingIssue.number} with new title, body, labels, milestone.`);
      //   if (CREATE_ISSUES_FLAG) { /* octokit.issues.update({ owner: REPO_OWNER, repo: REPO_NAME, issue_number: existingIssue.number, title: issueTitleFromAI, body: finalIssueBody, labels: suggestedLabelNamesFromAI, milestone: milestoneIdForGitHub }); */ }
      // }

      if (desiredStatusFromAI === "closed" && existingIssue.state === "open") {
        console.log(`DRY RUN: Roadmap item is DONE, GitHub issue is OPEN. Would CLOSE issue #${existingIssue.number}.`);
        // if (CREATE_ISSUES_FLAG) { /* octokit.issues.update({ state: "closed" }) */ }
      } else if (desiredStatusFromAI === "open" && existingIssue.state === "closed") {
        console.log(`DRY RUN: Roadmap item is OPEN, GitHub issue is CLOSED. Would REOPEN issue #${existingIssue.number}.`);
        // if (CREATE_ISSUES_FLAG) { /* octokit.issues.update({ state: "open" }) */ }
      } else {
        console.log(`DRY RUN: Issue #${existingIssue.number} state (${existingIssue.state}) matches desired state (${desiredStatusFromAI}). No state change needed.`);
      }
    } else {
      // Issue DOES NOT EXIST on GitHub
      if (desiredStatusFromAI === "open") {
        console.log(`DRY RUN: Roadmap item is OPEN, no existing GitHub issue. Would CREATE new issue: "${issueTitleFromAI}"`);
        // if (CREATE_ISSUES_FLAG) { 
        //   /* const newIssue = await octokit.issues.create({ owner: REPO_OWNER, ..., title: issueTitleFromAI, ... }); */ 
        //   /* console.log(\`LIVE RUN: Created issue #${newIssue.data.number}\`); */
        // }
      } else {
        // desiredStatusFromAI is "closed" and no issue exists on GitHub.
        console.log(`DRY RUN: Roadmap item "${originalRoadmapTitle}" is DONE and no corresponding GitHub issue found. No action needed.`);
      }
    }
  }
}

main().catch(console.error);
