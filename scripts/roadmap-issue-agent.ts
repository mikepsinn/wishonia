import dotenv from 'dotenv';
dotenv.config(); // Load .env file into process.env

import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateObject } from 'ai';
import { getModel, ModelName } from '@/lib/utils/modelUtils';
import { z } from 'zod';

const DEFAULT_AI_MODEL = 'gemini-2.5-pro' as ModelName;
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

function parseRoadmap(): RoadmapItem[] {
  const roadmapPath = path.join(process.cwd(), 'public/docs/roadmap.md');
  if (!fs.existsSync(roadmapPath)) return [];
  const content = fs.readFileSync(roadmapPath, 'utf-8');
  // Matches: - [ ] **Title** or - [x] **Title**
  const matches = content.match(/- \[( |x)\] \*\*(.+?)\*\*/g) || [];
  return matches.map(m => {
    const checked = m.startsWith('- [x]');
    const title = m.replace(/- \[( |x)\] \*\*|\*\*/g, '').trim();
    return { title, checked };
  });
}

function getFileTree(): string {
  try {
    return execSync('tree -L 3 -J .', { encoding: 'utf-8' });
  } catch {
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

function getTestFile(): string {
  const testPath = path.join(process.cwd(), 'tests/ai/generate-object.test.ts');
  return fs.existsSync(testPath) ? fs.readFileSync(testPath, 'utf-8') : '';
}

async function getAllIssues(): Promise<{ [title: string]: any }> {
  const issues: { [title: string]: any } = {};
  let page = 1;
  let done = false;
  while (!done) {
    const res = await octokit.issues.listForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      state: 'all',
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

// Define a Zod schema for the AI assessment response
const AiAssessmentSchema = z.object({
  assessment: z.string().describe("The AI's assessment of the roadmap item's status (implemented, partially implemented, or missing) with evidence."),
});

async function aiAssessRoadmapItem(item: RoadmapItem, roadmap: string, evidence: string): Promise<string> {
  const prompt = `Given the following roadmap and codebase evidence, assess the status of this roadmap item.\n\n` +
    `ROADMAP ITEM: ${item.title}\n\n` +
    `ROADMAP:\n${roadmap}\n\n` +
    `CODEBASE EVIDENCE:\n${evidence}\n\n` +
    `Is this item implemented, partially implemented, or missing? Please cite evidence from the codebase. Reply in markdown.`;
  
  const result = await generateObject({
    model: getModel(DEFAULT_AI_MODEL),
    schema: AiAssessmentSchema,
    prompt,
  });
  
  return result.object.assessment;
}

async function main() {
  const items = parseRoadmap();
  if (!items.length) {
    console.log('No roadmap items found.');
    return;
  }
  const roadmap = fs.readFileSync(path.join(process.cwd(), 'public/docs/roadmap.md'), 'utf-8');
  const fileTree = getFileTree();
  const readme = getReadme();
  const scripts = getPackageScripts();
  const evidence = `FILE TREE:\n${fileTree}\n\nREADME.md:\n${readme}\n\npackage.json scripts:\n${scripts}\n`;

  const issues = await getAllIssues();
  console.log(CREATE_ISSUES_FLAG ? "\n--- STARTING LIVE RUN (CREATE_ISSUES=true) ---" : "\n--- STARTING DRY RUN (to execute live, set CREATE_ISSUES=true) ---");

  for (const item of items) {
    const existing = issues[item.title];
    let issueNumber = existing ? existing.number : undefined;

    if (!existing) {
      if (CREATE_ISSUES_FLAG) {
        const res = await octokit.issues.create({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          title: item.title,
          body: `Roadmap item from public/docs/roadmap.md.\n\nStatus: ${item.checked ? 'Done' : 'TODO'}`,
        });
        issueNumber = res.data.number;
        if (item.checked) {
          await octokit.issues.update({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            issue_number: issueNumber,
            state: 'closed',
          });
          console.log(`LIVE RUN: Created and closed issue #${issueNumber}: ${item.title}`);
        } else {
          console.log(`LIVE RUN: Created open issue #${issueNumber}: ${item.title}`);
        }
      } else {
        console.log(`DRY RUN: Would create issue titled: "${item.title}" and set state to ${item.checked ? 'closed' : 'open'}`);
        issueNumber = -1; // Placeholder for dry run comment simulation
      }
    } else {
      issueNumber = existing.number;
      if (item.checked && existing.state !== 'closed') {
        if (CREATE_ISSUES_FLAG) {
          await octokit.issues.update({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            issue_number: issueNumber,
            state: 'closed',
          });
          console.log(`LIVE RUN: Closed issue #${issueNumber}: ${item.title}`);
        } else {
          console.log(`DRY RUN: Would close issue #${issueNumber}: ${item.title}`);
        }
      } else if (!item.checked && existing.state === 'closed') {
        if (CREATE_ISSUES_FLAG) {
          await octokit.issues.update({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            issue_number: issueNumber,
            state: 'open',
          });
          console.log(`LIVE RUN: Reopened issue #${issueNumber}: ${item.title}`);
        } else {
          console.log(`DRY RUN: Would reopen issue #${issueNumber}: ${item.title}`);
        }
      } else {
        // console.log(`No action needed for issue state: ${item.title}`); 
      }
    }

    if (issueNumber !== undefined && issueNumber !== -1) { 
      const aiComment = await aiAssessRoadmapItem(item, roadmap, evidence);
      if (CREATE_ISSUES_FLAG) {
        await octokit.issues.createComment({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          issue_number: issueNumber,
          body: `### ${DEFAULT_AI_MODEL} Assessment\n${aiComment}`,
        });
        console.log(`LIVE RUN: Commented AI assessment on issue #${issueNumber} for: ${item.title}`);
      } else {
        console.log(`DRY RUN: Would comment on issue #${issueNumber} for "${item.title}" with assessment:`);
      }
    } else if (issueNumber === -1) { 
        console.log(`DRY RUN: Would comment on NEWLY CREATED (simulated) issue for "${item.title}"`);
    }
  }
  console.log(CREATE_ISSUES_FLAG ? "--- LIVE RUN COMPLETE ---" : "--- DRY RUN COMPLETE ---");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 