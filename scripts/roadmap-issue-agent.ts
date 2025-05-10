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
const REPO_OWNER = process.env.REPO_OWNER || 'mikepsinn';
const REPO_NAME = process.env.REPO_NAME || 'wishonia';

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
  checked: boolean;
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
  due_on: z.string().optional().describe("Due date in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ). Provide if suggesting a NEW milestone, otherwise omit.")
  // We will fetch the 'number' (ID) separately if it's an existing milestone.
});
type GitHubMilestone = z.infer<typeof GitHubMilestoneSchema>;

const IssueCreationDataSchema = z.object({
  title: z.string().describe("The refined title for the GitHub issue, based on the roadmap item."),
  body: z.string().describe("The detailed assessment of the roadmap item's status (implemented, partially implemented, or missing), including evidence from the codebase. This will be the main body of the GitHub issue."),
  labels: z.array(GitHubLabelSchema).describe("An array of GitHubLabel objects. For existing labels, only 'name' is needed. For new labels, provide 'name' and optionally 'color' and 'description'."),
  milestone: GitHubMilestoneSchema.optional().describe("A GitHubMilestone object if this issue should be part of a milestone. For an existing milestone, only 'title' is needed. For a new milestone, provide 'title' and optionally 'description' and 'due_on'."),
  suggestedSubTasks: z.array(z.string()).optional().describe("An array of suggested sub-task titles if the main item should be broken down."),
  relevantFilePaths: z.array(z.string()).optional().describe("An array of relevant file paths from the codebase evidence.")
});

type IssueCreationData = z.infer<typeof IssueCreationDataSchema>;

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
    items.push({ title, checked });
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

async function getExistingLabelsAndMilestones(): Promise<{ labels: GitHubLabel[], milestones: (GitHubMilestone & { number: number; state: 'open' | 'closed' })[] }> {
  const existingData: { labels: GitHubLabel[], milestones: (GitHubMilestone & { number: number; state: 'open' | 'closed' })[] } = { labels: [], milestones: [] };
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
      // Ensure all properties from GitHubMilestone are included, plus number and state
      title: milestone.title,
      description: milestone.description || undefined,
      due_on: milestone.due_on || undefined,
      number: milestone.number,
      state: milestone.state as 'open' | 'closed',
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

async function aiAssessRoadmapItem(item: RoadmapItem, roadmap: string, evidence: string, existingLabels: GitHubLabel[], existingMilestones: (GitHubMilestone & { number: number; state: 'open' | 'closed' })[]): Promise<IssueCreationData> {
  const prompt = `
Given the following roadmap item, the overall roadmap, codebase evidence, and lists of existing labels and milestones, provide a structured GitHub issue creation plan.
Your goal is to help create a comprehensive GitHub issue.

Roadmap Item: "${item.title}"
Roadmap Item Current Status (from checkbox): ${item.checked ? 'Checked (Done)' : 'Unchecked (To Do)'}

Overall Roadmap:
${roadmap}

Codebase Evidence:
${evidence}

Existing Labels in Repository (name, color, description):
${existingLabels.length > 0 ? existingLabels.map(l => `- Name: ${l.name}, Color: ${l.color}, Desc: ${l.description || 'N/A'}`).join('\\n') : 'None'}

Existing Milestones in Repository (title, number, state, description, due_on):
${existingMilestones.length > 0 ? existingMilestones.map(m => `- Title: ${m.title}, ID: ${m.number}, State: ${m.state}, Desc: ${m.description || 'N/A'}, Due: ${m.due_on || 'N/A'}`).join('\\n') : 'None. Focus on open milestones if assigning.'}


Please provide the following information according to the Zod schema:
1.  title: A concise, clear title for the GitHub issue, based on the roadmap item.
2.  body: A detailed assessment of the roadmap item's current implementation status (e.g., implemented, partially implemented, missing, not started).
    - Cite specific evidence from the codebase (file paths, function names, etc.) to support your assessment.
    - If partially implemented, explain what's done and what's pending.
    - If not started, briefly outline the work required.
3.  labels: An array of GitHubLabel objects.
    - For an existing label you want to use, provide *only* its 'name'.
    - If you are suggesting a NEW label, you MUST provide its 'name', and you SHOULD provide 'color' (hex, no #) and 'description'.
4.  milestone: (Optional) A GitHubMilestone object if this issue should be part of a milestone.
    - For an existing OPEN milestone you want to use, provide *only* its 'title'.
    - If you are suggesting a NEW milestone, you MUST provide its 'title', and you SHOULD provide 'description' and 'due_on' (ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
    - If no suitable milestone, omit this field.
5.  suggestedSubTasks: (Optional) If this roadmap item is large or complex, suggest if it should be broken down into smaller, more atomic sub-task titles. If so, list them as an array of strings. Otherwise, omit or provide an empty array.
6.  relevantFilePaths: (Optional) Identify and list any specific file paths from the codebase evidence that are directly relevant to implementing this roadmap item or its sub-tasks. Otherwise, omit or provide an empty array.

Ensure your response is formatted strictly according to the Zod schema provided.
The state (open/closed) of the issue will be determined by the roadmap item's checkbox status separately.
Focus on using existing open milestones when suggesting a milestone for an issue.
`;

  const result = await generateObject({
    model: getModel(DEFAULT_AI_MODEL),
    schema: IssueCreationDataSchema,
    prompt,
  });

  return result.object;
}

async function main() {
  const items = parseRoadmap();
  if (!items.length) {
    console.log('No roadmap items found.');
    return;
  }
  const roadmapContent = fs.readFileSync(path.join(process.cwd(), 'public/docs/roadmap.md'), 'utf-8');
  const fileTree = getFileTree();
  const readme = getReadme();
  const scripts = getPackageScripts();
  const evidence = `FILE TREE:\n${fileTree}\n\nREADME.md:\n${readme}\n\npackage.json scripts:\n${scripts}\n`;

  let { labels: existingLabels, milestones: existingMilestones } = await getExistingLabelsAndMilestones();
  const existingIssues = await getAllIssues();
  console.log(CREATE_ISSUES_FLAG ? "\n--- STARTING LIVE RUN (CREATE_ISSUES=true) ---" : "\n--- STARTING DRY RUN (to execute live, set CREATE_ISSUES=true) ---");

  for (const item of items) {
    let existingIssue = existingIssues[item.title]; 
    
    const aiGeneratedData = await aiAssessRoadmapItem(item, roadmapContent, evidence, existingLabels, existingMilestones);
    const issueTitleFromAI = aiGeneratedData.title;
    const issueBodyFromAI = aiGeneratedData.body;
    const suggestedLabelsFromAI = aiGeneratedData.labels; // Array of GitHubLabel objects
    const suggestedMilestoneFromAI = aiGeneratedData.milestone; // GitHubMilestone object or undefined
    const suggestedSubTasksFromAI = aiGeneratedData.suggestedSubTasks || [];
    const relevantFilePathsFromAI = aiGeneratedData.relevantFilePaths || [];

    let finalIssueBody = issueBodyFromAI;
    if (suggestedSubTasksFromAI.length > 0) {
      finalIssueBody += "\n\n### Suggested Sub-tasks:\n" + suggestedSubTasksFromAI.map(task => `- [ ] ${task}`).join('\n');
    }
    if (relevantFilePathsFromAI.length > 0) {
      finalIssueBody += "\n\n### Relevant Files:\n" + relevantFilePathsFromAI.map(fp => `- ${fp}`).join('\n');
    }

    if (!existingIssue && item.title !== issueTitleFromAI) {
        const existingIssueByAiTitle = existingIssues[issueTitleFromAI];
        if (existingIssueByAiTitle) {
            console.log(`Found existing issue #${existingIssueByAiTitle.number} ("${existingIssueByAiTitle.title}") by AI-suggested title "${issueTitleFromAI}" for roadmap item "${item.title}".`);
            existingIssue = existingIssueByAiTitle; 
        }
    }

    let issueNumber = existingIssue ? existingIssue.number : undefined;

    // --- Process Labels ---
    const finalLabelNamesForIssue: string[] = [];
    if (suggestedLabelsFromAI && suggestedLabelsFromAI.length > 0) {
      for (const suggestedLabel of suggestedLabelsFromAI) {
        let existingLabel = existingLabels.find(l => l.name.toLowerCase() === suggestedLabel.name.toLowerCase());
        if (existingLabel) {
          finalLabelNamesForIssue.push(existingLabel.name);
        } else if (suggestedLabel.color || suggestedLabel.description) { // AI suggests it's a new label
          if (CREATE_ISSUES_FLAG) {
            try {
              console.log(`LIVE RUN: Creating new label "${suggestedLabel.name}"...`);
              const newLabel = await octokit.issues.createLabel({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                name: suggestedLabel.name,
                color: suggestedLabel.color?.replace('#', ''), // Ensure no #
                description: suggestedLabel.description,
              });
              finalLabelNamesForIssue.push(newLabel.data.name);
              existingLabels.push({ name: newLabel.data.name, color: newLabel.data.color, description: newLabel.data.description || undefined }); // Update cache
            } catch (error: any) {
              if (error.status === 422) { // Label already exists (race condition or case difference)
                 console.warn(`WARN: Label "${suggestedLabel.name}" likely already exists. Adding to issue.`);
                 finalLabelNamesForIssue.push(suggestedLabel.name); // Assume it exists and add
              } else {
                console.error(`Error creating label "${suggestedLabel.name}":`, error);
              }
            }
          } else {
            console.log(`DRY RUN: Would create new label "${suggestedLabel.name}" (Color: ${suggestedLabel.color}, Desc: ${suggestedLabel.description})`);
            finalLabelNamesForIssue.push(suggestedLabel.name); // Add for dry run log
          }
        } else { // AI just provided a name, assume it exists or is intended to be used as is
          finalLabelNamesForIssue.push(suggestedLabel.name);
        }
      }
    }

    // --- Process Milestone ---
    let milestoneNumberForIssue: number | undefined = undefined;
    if (suggestedMilestoneFromAI) {
      let existingMilestone = existingMilestones.find(m => m.title.toLowerCase() === suggestedMilestoneFromAI.title.toLowerCase() && m.state === 'open');
      
      if (existingMilestone) {
        milestoneNumberForIssue = existingMilestone.number;
        console.log(`INFO: Assigning to existing open milestone "${existingMilestone.title}" (#${milestoneNumberForIssue})`);
      } else if (suggestedMilestoneFromAI.description || suggestedMilestoneFromAI.due_on) { // AI suggests it's a new milestone
        // Check if any milestone (open or closed) with this title already exists to avoid duplicates
        const trulyExistingMilestone = existingMilestones.find(m => m.title.toLowerCase() === suggestedMilestoneFromAI.title.toLowerCase());
        if (trulyExistingMilestone) {
          console.warn(`WARN: Milestone "${suggestedMilestoneFromAI.title}" already exists (ID: ${trulyExistingMilestone.number}, State: ${trulyExistingMilestone.state}). Will not create a new one. Not assigning unless it was open and matched above.`);
          if(trulyExistingMilestone.state === 'open') milestoneNumberForIssue = trulyExistingMilestone.number; // Assign if it was open after all
        } else if (CREATE_ISSUES_FLAG) {
          try {
            console.log(`LIVE RUN: Creating new milestone "${suggestedMilestoneFromAI.title}"...`);
            const newMilestone = await octokit.issues.createMilestone({
              owner: REPO_OWNER,
              repo: REPO_NAME,
              title: suggestedMilestoneFromAI.title,
              description: suggestedMilestoneFromAI.description,
              due_on: suggestedMilestoneFromAI.due_on,
              state: 'open',
            });
            milestoneNumberForIssue = newMilestone.data.number;
            existingMilestones.push({ ...suggestedMilestoneFromAI, number: newMilestone.data.number, state: 'open' }); // Update cache
            console.log(`INFO: Created and will assign to new milestone "${newMilestone.data.title}" (#${milestoneNumberForIssue})`);
          } catch (error: any) {
             if (error.status === 422) { // Already exists
                 console.warn(`WARN: Milestone "${suggestedMilestoneFromAI.title}" likely already exists (created by another process?). Not assigning.`);
             } else {
                console.error(`Error creating milestone "${suggestedMilestoneFromAI.title}":`, error);
             }
          }
        } else {
          console.log(`DRY RUN: Would create new milestone "${suggestedMilestoneFromAI.title}" (Desc: ${suggestedMilestoneFromAI.description}, Due: ${suggestedMilestoneFromAI.due_on})`);
          // For dry run, we don't have a number, but can log the intent
        }
      } else {
        // AI just provided a title, but it didn't match an existing open one, and no details for new.
        console.log(`INFO: Milestone "${suggestedMilestoneFromAI.title}" suggested by AI, but no matching open milestone found and no details to create a new one. Not assigning milestone.`);
      }
    }

    // --- Create or Update Issue --- 
    if (!existingIssue) {
      if (CREATE_ISSUES_FLAG) {
        console.log(`LIVE RUN: Creating issue for "${item.title}" with AI-refined title "${issueTitleFromAI}"...`);
        const createParams: any = {
          owner: REPO_OWNER,
          repo: REPO_NAME,
          title: issueTitleFromAI,
          body: finalIssueBody,
          labels: finalLabelNamesForIssue.length > 0 ? finalLabelNamesForIssue : undefined,
          milestone: milestoneNumberForIssue,
        };
        const res = await octokit.issues.create(createParams);
        issueNumber = res.data.number;
        
        if (item.checked) {
          await octokit.issues.update({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            issue_number: issueNumber,
            state: 'closed',
          });
          console.log(`LIVE RUN: Created and closed issue #${issueNumber}: ${issueTitleFromAI}`);
        } else {
          console.log(`LIVE RUN: Created open issue #${issueNumber}: ${issueTitleFromAI}`);
        }
      } else {
        console.log(`DRY RUN: Would create issue with Title: "${issueTitleFromAI}"`);
        console.log(`DRY RUN: Body:\n${finalIssueBody.substring(0, 300)}...`);
        console.log(`DRY RUN: Labels: ${finalLabelNamesForIssue.join(', ') || 'None'}`);
        if (milestoneNumberForIssue) {
          console.log(`DRY RUN: Milestone ID: ${milestoneNumberForIssue}`);
        } else if (suggestedMilestoneFromAI) {
           console.log(`DRY RUN: Suggested Milestone Title (no ID assigned in dry run): ${suggestedMilestoneFromAI.title}`);
        }
        if (suggestedSubTasksFromAI.length > 0) {
            console.log(`DRY RUN: Suggested Sub-tasks: ${suggestedSubTasksFromAI.join(', ')}`);
        }
        if (relevantFilePathsFromAI.length > 0) {
            console.log(`DRY RUN: Relevant Files: ${relevantFilePathsFromAI.join(', ')}`);
        }
        console.log(`DRY RUN: Desired State (from roadmap): ${item.checked ? 'closed' : 'open'}`);
      }
    } else { 
      console.log(`Processing existing issue #${issueNumber} ("${existingIssue.title}") for roadmap item "${item.title}"`);
      if (CREATE_ISSUES_FLAG) {
        const updateParams: any = {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            issue_number: issueNumber!,
            title: issueTitleFromAI,
            body: finalIssueBody,
            labels: finalLabelNamesForIssue.length > 0 ? finalLabelNamesForIssue : undefined,
            milestone: milestoneNumberForIssue, // Use null to remove, undefined to leave as is, or number to set.
        };
        
        await octokit.issues.update(updateParams);
        console.log(`LIVE RUN: Updated issue #${issueNumber} with AI assessment and details.`);

        if (item.checked && existingIssue.state !== 'closed') {
          await octokit.issues.update({ owner: REPO_OWNER, repo: REPO_NAME, issue_number: issueNumber!, state: 'closed' });
          console.log(`LIVE RUN: Closed issue #${issueNumber}: ${issueTitleFromAI}`);
        } else if (!item.checked && existingIssue.state === 'closed') {
          await octokit.issues.update({ owner: REPO_OWNER, repo: REPO_NAME, issue_number: issueNumber!, state: 'open' });
          console.log(`LIVE RUN: Reopened issue #${issueNumber}: ${issueTitleFromAI}`);
        }
      } else { 
        console.log(`DRY RUN: Would update issue #${issueNumber} ("${existingIssue.title}"):`);
        console.log(`DRY RUN: New Title (if changed): "${issueTitleFromAI}"`);
        console.log(`DRY RUN: New Body:\n${finalIssueBody.substring(0, 300)}...`);
        console.log(`DRY RUN: New Labels: ${finalLabelNamesForIssue.join(', ') || 'None'}`);
        if (milestoneNumberForIssue) {
          console.log(`DRY RUN: New Milestone ID: ${milestoneNumberForIssue}`);
        } else if (suggestedMilestoneFromAI) {
            console.log(`DRY RUN: Suggested New Milestone Title (no ID assigned in dry run): ${suggestedMilestoneFromAI.title}`);
        }
        if (suggestedSubTasksFromAI.length > 0) {
            console.log(`DRY RUN: Suggested Sub-tasks: ${suggestedSubTasksFromAI.join(', ')}`);
        }
        if (relevantFilePathsFromAI.length > 0) {
            console.log(`DRY RUN: Relevant Files: ${relevantFilePathsFromAI.join(', ')}`);
        }
        if (item.checked && existingIssue.state !== 'closed') {
          console.log(`DRY RUN: Would close issue #${issueNumber}: ${issueTitleFromAI}`);
        } else if (!item.checked && existingIssue.state === 'closed') {
          console.log(`DRY RUN: Would reopen issue #${issueNumber}: ${issueTitleFromAI}`);
        }
      }
    }
  }
  console.log(CREATE_ISSUES_FLAG ? "--- LIVE RUN COMPLETE ---" : "--- DRY RUN COMPLETE ---");
}

main().catch(e => {
  console.error("Error in main execution:", e);
  process.exit(1);
}); 