import * as fs from 'fs';
import * as path from 'path';

const projectRoot: string = path.join(__dirname, '..');
const appDirPath: string = path.join(projectRoot, 'app');
const libDirPath: string = path.join(projectRoot, 'lib');
const componentsDirPath: string = path.join(projectRoot, 'components');

const targetDirsForReplace: string[] = [appDirPath, libDirPath, componentsDirPath];
const textFileExtensions: string[] = ['.js', '.jsx', '.ts', '.tsx', '.md', '.mdx', '.json']; 
const foldersToSkipRenaming: string[] = ['api', 'components', 'styles']; 

function toKebabCase(str: string): string {
    if (!str) return '';
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();
}

function isKebabCase(str: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str) && !/[A-Z]/.test(str);
}

function getAllTextFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    try {
        const entries: fs.Dirent[] = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath: string = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build' || entry.name === 'public') { 
                    continue;
                }
                getAllTextFiles(fullPath, arrayOfFiles);
            } else if (textFileExtensions.includes(path.extname(entry.name).toLowerCase())) {
                arrayOfFiles.push(fullPath);
            }
        }
    } catch (error: any) {
        console.warn(`Could not read directory ${dirPath}: ${error.message}`);
    }
    return arrayOfFiles;
}

function findAndReplaceInFile(filePath: string, oldFolderName: string, newKebabFolderName: string): void {
    try {
        let content: string = fs.readFileSync(filePath, 'utf8');
        let originalContent: string = content;
        let changed: boolean = false;

        const regex1 = new RegExp(`([\"\'\\\`])(\\\/${oldFolderName})(?=[\\\\\\/\\\\?\\\\#\"\'\\\`\\\\s]|$)`, 'g');
        content = content.replace(regex1, (match, p1_quote, p2_path) => {
            changed = true;
            return `${p1_quote}/${newKebabFolderName}`;
        });

        const regex2 = new RegExp(`([\"\'\\\`])(@\\\\\\/app\\\\\\/${oldFolderName})(?=[\\\\\\/\'\"\\\`\\\\s]|$)`, 'g');
        content = content.replace(regex2, (match, p1_quote, p2_path) => {
            changed = true;
            return `${p1_quote}@/app/${newKebabFolderName}`;
        });
        
        const regex3 = new RegExp(`(from\\\\s+[\"\'\\\`]@\\\\\\/app\\\\\\/)${oldFolderName}(\\\\/[^\"\'\\\`\\\\s]+[\"\'\\\`])`, 'g');
        content = content.replace(regex3, `$1${newKebabFolderName}$2`);
        if (content !== originalContent && !changed) changed = true;

        const regex4 = new RegExp(`(href=[\"\'\\\`])${oldFolderName}(\\\\/[^\"\'\\\`\\\\s]*[\"\'\\\`])`, 'g');
         content = content.replace(regex4, (match, p1, p2) => {
             changed = true;
             return `${p1}${newKebabFolderName}${p2}`;
         });
        if (content !== originalContent && !changed) changed = true;
        
        const regex5 = new RegExp(`(href=[\"\'\\\`])${oldFolderName}([\"\'\\\`])`, 'g');
         content = content.replace(regex5, (match, p1, p2) => {
             changed = true;
             return `${p1}${newKebabFolderName}${p2}`;
         });
        if (content !== originalContent && !changed) changed = true;

        // NEW Regex 6: Catch folder names within paths like /path/folderName/
        const regex6 = new RegExp(`([\"\'\\\`\\/])(${oldFolderName})([\\/\"\'\\\`\\?#])`, 'g');
        content = content.replace(regex6, (match, p1_prefix, p2_folder, p3_suffix) => {
            changed = true;
            return `${p1_prefix}${newKebabFolderName}${p3_suffix}`;
        });
        if (content !== originalContent && !changed) changed = true;
        
        if (changed) {
            console.log(`  Updating references in: ${filePath}`);
            fs.writeFileSync(filePath, content, 'utf8');
        }
    } catch (error: any) {
        console.error(`  Error processing file ${filePath}: ${error.message}`);
    }
}


function recursivelyRenameFolders(dirPath: string, allFilesToSearch: string[]): void {
    const entries: fs.Dirent[] = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const folderName = entry.name;
        const fullPath = path.join(dirPath, folderName);
        // Skip dot folders, dynamic routes, and skip list
        if (
            folderName.startsWith('.') ||
            folderName.includes('[') || folderName.includes(']') ||
            (folderName.startsWith('(') && folderName.endsWith(')')) ||
            foldersToSkipRenaming.includes(folderName.toLowerCase())
        ) {
            // Still recurse into these folders, except for skip list
            if (!foldersToSkipRenaming.includes(folderName.toLowerCase())) {
                recursivelyRenameFolders(fullPath, allFilesToSearch);
            }
            continue;
        }
        if (isKebabCase(folderName)) {
            recursivelyRenameFolders(fullPath, allFilesToSearch);
            continue;
        }
        const kebabCaseName: string = toKebabCase(folderName);
        if (folderName === kebabCaseName) {
            recursivelyRenameFolders(fullPath, allFilesToSearch);
            continue;
        }
        console.log(`\nProcessing folder: ${fullPath} -> ${kebabCaseName}`);
        const newPath: string = path.join(dirPath, kebabCaseName);
        console.log(`  Step 1: Updating references from "${folderName}" to "${kebabCaseName}" across project...`);
        for (const file of allFilesToSearch) {
            findAndReplaceInFile(file, folderName, kebabCaseName);
        }
        try {
            console.log(`  Step 2: Renaming folder: ${fullPath} -> ${newPath}`);
            fs.renameSync(fullPath, newPath);
            console.log(`  Successfully renamed ${folderName} to ${kebabCaseName}.`);
            // Recurse into the newly renamed folder
            recursivelyRenameFolders(newPath, allFilesToSearch);
        } catch (error: any) {
            console.error(`  Error renaming folder ${fullPath} to ${newPath}: ${error.message}`);
            console.error(`  PLEASE NOTE: References for ${folderName} might have been updated, but the folder itself was NOT renamed.`);
            console.error('  You may need to manually rename it or revert changes if this is unintended.');
        }
        console.log(`--- Finished processing for ${folderName} ---`);
    }
}

function run(): void {
    console.log('Starting folder name refactoring script...');
    console.log('IMPORTANT: Ensure your code is committed to version control before proceeding.');

    let allFilesToSearch: string[] = [];
    console.log('\nCollecting all text files to scan for replacements...');
    targetDirsForReplace.forEach(dir => {
        getAllTextFiles(dir, allFilesToSearch);
    });
    console.log(`Found ${allFilesToSearch.length} text files to scan.`);

    // Recursively process all folders in each target directory
    for (const dir of targetDirsForReplace) {
        console.log(`\nRecursively processing folders in: ${dir}`);
        recursivelyRenameFolders(dir, allFilesToSearch);
    }
    console.log('\nScript finished.');
}

run(); 