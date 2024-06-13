import {textCompletion} from "@/lib/llm";
import { prisma } from "@/lib/db";
import {GlobalProblem, GlobalSolution} from "@prisma/client";
import {sharedSolutionPromptText} from "@/lib/globalSolutionsGenerator";
import {generateAndUploadFeaturedImageJpg} from "@/lib/imageGenerator";
import {absPathFromRepo} from "@/lib/fileHelper";
import fs from "fs";

const generateImages = false;
export async function linkGlobalProblemSolution(globalProblem: GlobalProblem,
                                         globalSolution: GlobalSolution) {
    const description = await textCompletion(
        `Write a brief description of how the solution "${globalSolution.name}" addresses the global problem "${globalProblem.name}".`,
        'text');
    const content = await generateProblemSolutionContent(globalProblem, globalSolution);
    let featuredImage = globalSolution.featuredImage;
    if(!featuredImage && generateImages) {
        featuredImage = await generateAndUploadFeaturedImageJpg(
            `How ${globalSolution.name} Solves ${globalProblem.name}`,
            `global-problem-solutions/${globalProblem.id}-${globalSolution.id}.jpg`);
    }
    return prisma.globalProblemSolution.create({
        data: {
            globalProblemId: globalProblem.id,
            globalSolutionId: globalSolution.id,
            name: `How ${globalSolution.name} Solves ${globalProblem.name}`,
            description: description,
            content: content,
            featuredImage: featuredImage,
        }
    });
}

async function generateProblemSolutionContent(globalProblem: GlobalProblem, globalSolution: GlobalSolution) {
    return await textCompletion(
        `Write a comprehensive article about how the solution "${globalSolution.name}" addresses the global problem "${globalProblem.name}".
        
        ${sharedSolutionPromptText}
        `,
        'text');
}

export async function generateGlobalProblemSolutions() {
    const globalProblems = await prisma.globalProblem.findMany();
    const globalSolutions = await prisma.globalSolution.findMany();
    const globalProblemSolutions = await prisma.globalProblemSolution.findMany();
    // Calculate the number of combinations of globalProblems and globalSolutions
    const numberOfCombinations = globalProblems.length * globalSolutions.length;
    console.log(`There are ${numberOfCombinations} possible global problem-solution combinations`);
    let count = 0;
    for (const globalProblem of globalProblems) {
        for (const globalSolution of globalSolutions) {
            count++;
            const percentage = (count / numberOfCombinations) * 100;
            console.log(`Progress: ${count}/${numberOfCombinations} (${percentage.toFixed(2)}%)`);
            if(globalProblemSolutions.some(gps =>
                gps.globalProblemId === globalProblem.id && gps.globalSolutionId === globalSolution.id)){
                console.log(`Already linked ${globalSolution.name} to ${globalProblem.name}`);
                continue;
            }
            if(alreadyUpdated(globalSolution, globalProblem)){
                console.log(`Already checked ${globalSolution.name} for ${globalProblem.name}`);
                continue;
            }
            const prompt = `Is the solution "${globalSolution.name}"
            a good solution for the global problem "${globalProblem.name}"?
            Please only respond with the word YES or the word NO.
            `;
            const isGoodSolution = await textCompletion(prompt,
                'text');
            console.log(`Would "${globalSolution.name}"
contribute to solving the global problem of     
 "${globalProblem.name}"?
             Answer: ${isGoodSolution}`)
            if(isGoodSolution === 'YES'){
                await linkGlobalProblemSolution(globalProblem, globalSolution);
            }
            cacheCheckedId(globalSolution, globalProblem);
        }
    }
}

const cacheFilePath = absPathFromRepo('updatedGlobalProblemSolutionIds.json');

function cacheCheckedId(globalSolution: GlobalSolution, globalProblem: GlobalProblem) {
    const pair = createCachePair(globalSolution, globalProblem);
    if(!fs.existsSync(cacheFilePath)) {
        fs.writeFileSync(cacheFilePath, JSON.stringify([pair]));
        return;
    }
    const updatedIds = getCachedIds();
    updatedIds.push(pair);
    // Save Pretty Print
    fs.writeFileSync(cacheFilePath, JSON.stringify(updatedIds, null, 4));
}

function alreadyUpdated(globalSolution: GlobalSolution, globalProblem: GlobalProblem) {
    const updatedIds = getCachedIds();
    return updatedIds.some(pair =>
        pair.globalSolutionId === globalSolution.id && pair.globalProblemId === globalProblem.id);
}

function getCachedIds(): {globalSolutionId: string, globalProblemId: string}[] {
    if(!fs.existsSync(cacheFilePath)) {
        return [];
    }
    const str = fs.readFileSync(cacheFilePath);
    return JSON.parse(str.toString());
}

function createCachePair(globalSolution: GlobalSolution, globalProblem: GlobalProblem) {
    return {
        globalSolutionId: globalSolution.id,
        globalProblemId: globalProblem.id,
    }
}