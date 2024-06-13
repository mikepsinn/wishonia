/**
 * @jest-environment node
 */
import {getMarkdownFilesWithoutMetaData, readAllMarkdownFiles} from "@/lib/markdownReader";
import {generateMetadataWhereMissing} from "@/lib/metadataGenerator";
import {generateWishingWellMarkdown} from "@/lib/wishingWellMarkdownGenerator";
import {generateGlobalProblems} from "@/lib/globalProblemGenerator";
import {generateMarkdownPageList} from "@/lib/markdownPageListGenerator";
import {absPathFromPublic, absPathFromRepo, getNonIgnoredFiles} from "@/lib/fileHelper";

describe("Test Markdown Reader", () => {
    // Set timeout to 10 minutes
    jest.setTimeout(600000);
    it("gets markdown files without metadata", async () => {
        const mdFiles = await getMarkdownFilesWithoutMetaData(absPathFromRepo('public'));
        expect(mdFiles.length).toEqual(0);
    })
    it("metadata updater", async () => {
        let mdFilesUpdated = await generateMetadataWhereMissing(
            'docs');
        const mdFilesWithoutMetaData = await getMarkdownFilesWithoutMetaData(absPathFromRepo('public'));
        expect(mdFilesWithoutMetaData.length).toEqual(0);
    });
    it("gets markdown posts", async () => {
        const absFolderPath = absPathFromPublic('docs/roadmap');
        const allFiles = getNonIgnoredFiles(absFolderPath);
        let mdFiles = await readAllMarkdownFiles(absFolderPath);
        expect(allFiles.length).toBeGreaterThan(0);
        let hasWishoniaGovernment = allFiles.some(file => file.endsWith('wishonian-government.md'));
        expect(hasWishoniaGovernment).toBeTruthy();
        mdFiles = await readAllMarkdownFiles();
        expect(mdFiles.length).toBeGreaterThan(60);
        hasWishoniaGovernment = mdFiles.some(mdFile => mdFile.absFilePath.includes('wishonian-government.md'));
        expect(hasWishoniaGovernment).toBeTruthy();

    });
    it("generates markdown and images for default wishing wells", async () => {
        const posts = await generateWishingWellMarkdown();
        expect(posts).toHaveLength(10);
    });

    it("generates markdown and images for default wishing wells", async () => {
        const posts = await generateGlobalProblems();
        expect(posts).toHaveLength(10);
    });
    it("generates markdown page list", async () => {
        const result = await generateMarkdownPageList();
        expect(result).toBeUndefined();
    });
});