import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { z } from 'zod'
import { generateObject, NoObjectGeneratedError } from 'ai'
import dotenv from 'dotenv'
import type { NavItem } from '../lib/types/navigation'
import { defaultGoogleModel } from '../lib/ai/google'
import { logger } from '../lib/logger'

// Load environment variables (.env file in the root)
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const aiModel = defaultGoogleModel
const LOG_PREFIX = '[generate-route-tree]' // Updated log prefix

// --- Zod Schemas for AI ---
const SingleAISuggestionSchema = z.object({
  originalPath: z.string().describe("The original URL path this suggestion corresponds to (e.g., '/patient/conditions'). Crucial for mapping."),
  title: z.string().max(30, "Title too long").describe("Generate a concise, user-friendly title (max 4 words, Title Case) based on the original path."),
  description: z.string().max(240, "Description too long").optional().describe("Generate a brief (1-2 sentence) description of the page's purpose suitable for tooltips. Infer from the path."),
  emoji: z.string().describe("Generate a single relevant emoji (can be multi-character like 🧑‍💻) based on the title/path.")
})
const AIResponseSchema = z.array(SingleAISuggestionSchema)
type AISuggestion = z.infer<typeof SingleAISuggestionSchema>

// --- Path Discovery & Initial Node Structure ---
interface DiscoveredPathNode {
  name: string
  path: string
  children?: DiscoveredPathNode[]
  isPage: boolean
}

const appDirectory = path.resolve(process.cwd(), 'app')
const ignoredSegments = new Set(['lib', 'actions', 'components', 'api', 'auth', 'assets', 'static', 'public']) // Added more common ignores
const ignoredFiles = new Set(['layout.tsx', 'loading.tsx', 'error.tsx', 'template.tsx', 'not-found.tsx', 'route.ts', 'page.js', 'layout.js']) // Added .js and route.ts

function formatSegmentNameForDefaults(segment: string): string {
  if (segment.startsWith('[...') && segment.endsWith(']')) {
    return `Detail (${segment.slice(4, -1)})` // Changed from Catch-all
  }
  if (segment.startsWith('[') && segment.endsWith(']')) {
    return `Dynamic (${segment.slice(1, -1)})`
  }
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\\b\\w/g, (char) => char.toUpperCase())
}

function discoverPathsRecursive(dirPath: string, currentRoutePath: string): DiscoveredPathNode | null {
  try {
    const stats = fs.statSync(dirPath)
    if (!stats.isDirectory()) return null

    const segmentName = path.basename(dirPath)
    if (segmentName.startsWith('_') || segmentName.startsWith('.')) {
      logger.debug(`${LOG_PREFIX} Skipping private/utility directory: ${segmentName}`)
      return null
    }
    
    let isPageRouteGroup = segmentName.startsWith('(') && segmentName.endsWith(')')
    let effectiveRoutePath = currentRoutePath
    if (isPageRouteGroup) {
      logger.debug(`${LOG_PREFIX} Processing route group: ${segmentName}, current path: ${currentRoutePath}`)
      // Route groups don't add to the path
    } else {
      effectiveRoutePath = `${currentRoutePath}/${segmentName}`
    }

    let hasPage = fs.existsSync(path.join(dirPath, 'page.tsx')) || fs.existsSync(path.join(dirPath, 'page.js'))
    const children: DiscoveredPathNode[] = []
    const entries = fs.readdirSync(dirPath)

    for (const entry of entries) {
      const fullEntryPath = path.join(dirPath, entry)
      const entryStats = fs.statSync(fullEntryPath)

      if (entryStats.isDirectory()) {
        if (ignoredSegments.has(entry) || entry.startsWith('_') || entry.startsWith('.')) {
          logger.debug(`${LOG_PREFIX} Skipping ignored/private segment: ${entry}`)
          continue
        }
        const childNode = discoverPathsRecursive(fullEntryPath, effectiveRoutePath)
        if (childNode) {
          if (childNode.name === '__GROUP__PLACEHOLDER__') { // If child was a group, merge its children
            if (childNode.children) children.push(...childNode.children)
          } else {
            children.push(childNode)
          }
        }
      } else if ((entry === 'page.tsx' || entry === 'page.js') && !isPageRouteGroup) { // Only count page.tsx if not in a group for THIS node
        hasPage = true
      }
    }
    
    // If this is a route group, its "page" status is determined by its children, and it doesn't form a node itself unless it has page children.
    // Its path is the parent's path.
    if (isPageRouteGroup) {
      if (children.length > 0) {
        logger.debug(`${LOG_PREFIX} Route group ${segmentName} has children, returning as placeholder.`)
        // This node itself doesn't represent a page, but its children might.
        // It acts as a container for its children at the current path level.
        return { name: '__GROUP__PLACEHOLDER__', path: currentRoutePath, children: children.sort((a,b) => a.path.localeCompare(b.path)), isPage: false }
      }
      return null // Empty route group
    }

    // Create a node if it IS a page or has children that are pages/contain pages.
    if (hasPage || children.length > 0) {
      const nodeName = (dirPath === appDirectory && effectiveRoutePath === '/') 
        ? 'Home' 
        : formatSegmentNameForDefaults(segmentName)
      
      const finalPath = effectiveRoutePath === '' && dirPath === appDirectory ? '/' : effectiveRoutePath

      logger.debug(`${LOG_PREFIX} Creating discovered node: Name="${nodeName}", Path="${finalPath}", HasPage=${hasPage}, Children=${children.length}`)
      return {
        name: nodeName,
        path: finalPath,
        children: children.length > 0 ? children.sort((a,b) => a.path.localeCompare(b.path)) : undefined,
        isPage: hasPage,
      }
    }
    logger.debug(`${LOG_PREFIX} Skipping directory (no page and no viable children): ${path.relative(process.cwd(), dirPath)}`)
    return null
  } catch (error: any) {
    if (error.code === 'ENOENT' || error.code === 'EACCES') {
      logger.warn(`${LOG_PREFIX} Skipping inaccessible path ${path.relative(process.cwd(), dirPath)}: ${error.message}`)
    } else {
      logger.error(`${LOG_PREFIX} Error processing directory ${path.relative(process.cwd(), dirPath)}:`, error)
    }
    return null
  }
}

function flattenDiscoveredPaths(node: DiscoveredPathNode | null): { name: string, path: string }[] {
  if (!node) return []
  let flatList: { name: string, path: string }[] = []
  if (node.isPage && node.name !== '__GROUP__PLACEHOLDER__') {
    flatList.push({ name: node.name, path: node.path })
  }
  if (node.children) {
    for (const child of node.children) {
      flatList.push(...flattenDiscoveredPaths(child))
    }
  }
  return flatList
}

// --- AI Cache (lib/generated-nav-tree.ts) ---
const AI_CACHE_FILENAME = 'generated-nav-tree.ts'
const aiCacheFilePath = path.resolve(process.cwd(), 'lib', AI_CACHE_FILENAME)

async function loadAiCache(): Promise<Record<string, NavItem>> {
  try {
    if (fs.existsSync(aiCacheFilePath)) {
      logger.info(`${LOG_PREFIX} Loading AI cache from ${path.relative(process.cwd(), aiCacheFilePath)}`)
      const fileUrl = pathToFileURL(aiCacheFilePath).href + `?t=${Date.now()}` // Cache buster
      const existingModule = await import(fileUrl)
      if (existingModule && typeof existingModule.navigationTreeObject === 'object') {
        logger.info(`${LOG_PREFIX} Successfully loaded navigationTreeObject from AI cache.`)
        return existingModule.navigationTreeObject as Record<string, NavItem>
      }
      logger.warn(`${LOG_PREFIX} AI cache file found but failed to load or parse navigationTreeObject.`)
    } else {
      logger.info(`${LOG_PREFIX} No existing AI cache file found. Generating from scratch if needed.`)
    }
  } catch (error: any) {
    logger.error(`${LOG_PREFIX} Error loading AI cache:`, { message: error.message, stack: error.stack })
  }
  return {}
}

function saveAiCache(navObject: Record<string, NavItem>): void {
  const outputDir = path.dirname(aiCacheFilePath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  const generatedKeys = Object.keys(navObject).sort()
  const interfaceProperties = generatedKeys
    .map(key => `  readonly '${key}': NavItem;`)
    .join('\\n')
  const generatedInterfaceString = `export interface GeneratedNavTree {\n${interfaceProperties.length > 0 ? interfaceProperties : '  // No keys generated'}\n}`

  const fileContent = `// This file is auto-generated by ${path.basename(__filename)}
// It serves as a cache for AI-generated navigation metadata. Do not edit directly.
import type { NavItem } from './types/navigation'; // Assuming types/navigation.ts is in the same lib/ folder

${generatedInterfaceString}

export const navigationTreeObject: GeneratedNavTree = ${JSON.stringify(navObject, null, 2)};
`
  fs.writeFileSync(aiCacheFilePath, fileContent, 'utf8')
  logger.info(`${LOG_PREFIX} AI cache saved to ${path.relative(process.cwd(), aiCacheFilePath)}`)
}

// --- AI Interaction ---
function pathToSnakeCaseKey(navPath: string): string {
  if (navPath === '/') return 'root'
  return navPath
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/\[\.\.\.(.*?)\]/g, 'catchall_$1')
    .replace(/\[(.*?)\]/g, '$1')
    .replace(/[-\/]/g, '_')
    .toLowerCase()
}

async function getAiSuggestionsForNodes(nodesToSuggestFor: { name: string, path: string }[]): Promise<Map<string, AISuggestion>> {
  const suggestionsMap = new Map<string, AISuggestion>()
  if (!aiModel) {
    logger.warn(`${LOG_PREFIX} AI model not configured. Skipping AI suggestions.`)
    return suggestionsMap
  }
  if (nodesToSuggestFor.length === 0) {
    logger.info(`${LOG_PREFIX} No new or incomplete paths found requiring AI suggestions.`)
    return suggestionsMap
  }

  const inputList = nodesToSuggestFor.map(n => ({ path: n.path, name: n.name })) // name is the default discovered name
  const prompt = `Generate navigation properties (title, description, emoji) for the following list of URL paths and their original names.
Return the result as a JSON array matching the schema, ensuring each object includes the 'originalPath'.
Base your suggestions on common web conventions and the likely purpose of each path.
Input List:
${JSON.stringify(inputList, null, 2)}`;

  logger.info(`${LOG_PREFIX} Requesting AI suggestions for ${nodesToSuggestFor.length} paths...`)
  try {
    const { object: aiSuggestionsArray } = await generateObject({
      model: aiModel,
      schema: AIResponseSchema,
      prompt: prompt,
      maxTokens: 2000, // Adjust as needed
    })
    aiSuggestionsArray.forEach(suggestion => {
      if (suggestion.originalPath) {
        suggestionsMap.set(suggestion.originalPath, suggestion)
      } else {
        logger.warn(`AI suggestion missing originalPath: ${JSON.stringify(suggestion)}`)
      }
    })
    logger.info(`${LOG_PREFIX} Received ${suggestionsMap.size} suggestions from AI.`)
  } catch (error) {
    if (error instanceof NoObjectGeneratedError) {
      logger.error(`${LOG_PREFIX} AI failed to generate suggestions (NoObjectGeneratedError).`)
    } else {
      logger.error(`${LOG_PREFIX} Error getting AI suggestions:`, error)
    }
  }
  return suggestionsMap
}

// --- Final Hierarchical RouteNode Structure ---
export interface RouteNode {
  name: string
  path: string
  isDynamic: boolean
  title: string
  description?: string
  emoji?: string
  children: { [key: string]: RouteNode }
}

function buildHierarchicalRouteTreeRecursive(
  currentFsScanNode: DiscoveredPathNode,
  enrichedNavData: Map<string, NavItem>
): RouteNode | null {
  
  const navKey = pathToSnakeCaseKey(currentFsScanNode.path)
  const enrichedInfo = enrichedNavData.get(navKey)

  const defaultTitle = (currentFsScanNode.path === '/') 
    ? 'Home' 
    : formatSegmentNameForDefaults(currentFsScanNode.name)

  const nodeTitle = enrichedInfo?.title ?? defaultTitle
  const nodeDescription = enrichedInfo?.description
  const nodeEmoji = enrichedInfo?.emoji

  // Determine the key for the children map - this should be the dynamic segment name or the static name
  // For example, for path '/users/[userId]', the name from DiscoveredPathNode might be 'userId' if segment was '[userId]'
  // or 'User Details' if segment was '[userId]' and formatSegmentNameForDefaults produced that.
  // For the RouteNode's 'name' property, we want the clean segment.
  let routeNodeName = currentFsScanNode.name // Start with the formatted discovered name
  const segment = path.basename(currentFsScanNode.path) // Get the actual segment like '[userId]' or 'settings'
  if (segment.startsWith('[') && segment.endsWith(']')) {
    routeNodeName = segment.slice(1, -1).replace('...', '') // '[userId]' -> 'userId', '[...slug]' -> 'slug'
  } else if (currentFsScanNode.path !== '/') {
    routeNodeName = segment // 'settings' -> 'settings'
  } else {
    routeNodeName = 'root' // For the absolute root
  }

  const resultNode: RouteNode = {
    name: routeNodeName,
    path: currentFsScanNode.path,
    isDynamic: segment.startsWith('[') && segment.endsWith(']'),
    title: nodeTitle,
    description: nodeDescription,
    emoji: nodeEmoji,
    children: {}
  }
  
  logger.debug(`${LOG_PREFIX} Building RouteNode: Name="${resultNode.name}", Path="${resultNode.path}", Title="${resultNode.title}"`)

  if (currentFsScanNode.children && currentFsScanNode.children.length > 0) {
    for (const childDiscoverNode of currentFsScanNode.children) {
      // Only process if childDiscoverNode itself is a page OR it's a placeholder with children (implicitly meaning it leads to pages)
      if (childDiscoverNode.isPage || (childDiscoverNode.name === '__GROUP__PLACEHOLDER__' && childDiscoverNode.children && childDiscoverNode.children.length > 0)) {
         const childRouteNode = buildHierarchicalRouteTreeRecursive(childDiscoverNode, enrichedNavData)
         if (childRouteNode) {
             // The key for children should be the 'name' of the childRouteNode,
             // which is its clean segment name (e.g., 'userId', 'settings').
             resultNode.children[childRouteNode.name] = childRouteNode
         }
      } else if (childDiscoverNode.children && childDiscoverNode.children.length > 0) {
        // This case handles a non-page directory that itself has children.
        // We need to process its children to see if they contribute to the tree.
        // This is more complex if we only want page-bearing branches.
        // For simplicity now, we assume if discoverPathsRecursive included it, it's relevant.
        const childRouteNode = buildHierarchicalRouteTreeRecursive(childDiscoverNode, enrichedNavData)
        if (childRouteNode) {
            resultNode.children[childRouteNode.name] = childRouteNode
        }
      }
    }
  }
   // Only return the node if it's a page itself, or if it has children that are pages.
   // This avoids empty branches in the final tree.
  if (currentFsScanNode.isPage || Object.keys(resultNode.children).length > 0) {
    return resultNode
  }

  logger.debug(`${LOG_PREFIX} Pruning branch (not a page and no page children): ${currentFsScanNode.path}`)
  return null
}

// --- Main Orchestration ---
async function main() {
  logger.info(`${LOG_PREFIX} Starting route tree generation...`)

  // 1. Discover all paths from file system
  const discoveredRoot = discoverPathsRecursive(appDirectory, '') // Start with empty currentRoutePath for root
  const flatDiscoveredPaths = flattenDiscoveredPaths(discoveredRoot)
    .filter(p => p.path !== '__GROUP__PLACEHOLDER__') // Ensure placeholders are not processed
    .sort((a,b) => a.path.localeCompare(b.path)) // Sort for consistent processing

  logger.info(`${LOG_PREFIX} Discovered ${flatDiscoveredPaths.length} unique page paths from file system.`)
  if (flatDiscoveredPaths.length === 0) {
    logger.warn(`${LOG_PREFIX} No navigable paths found in 'app' directory. Output will be minimal.`)
  }

  // 2. Load existing AI cache
  const aiCache = await loadAiCache() // This is Record<string, NavItem> keyed by snake_case_path

  // 3. Identify nodes needing AI suggestions
  const nodesForAI: { name: string, path: string }[] = []
  const currentEnrichedData = new Map<string, NavItem>() // Will store NavItems, keyed by snake_case_path

  for (const discoveredPath of flatDiscoveredPaths) {
    const key = pathToSnakeCaseKey(discoveredPath.path)
    const existingEntry = aiCache[key]
    if (!existingEntry || !existingEntry.description || !existingEntry.emoji || !existingEntry.title) {
      if (!existingEntry) logger.debug(`${LOG_PREFIX} Path '${discoveredPath.path}' is new, needs AI suggestion.`)
      else logger.debug(`${LOG_PREFIX} Path '${discoveredPath.path}' is incomplete (Title: ${!!existingEntry.title}, Desc: ${!!existingEntry.description}, Emoji: ${!!existingEntry.emoji}), needs AI suggestion.`)
      nodesForAI.push({ name: discoveredPath.name, path: discoveredPath.path }) // name is default from discovery
    } else {
      logger.debug(`${LOG_PREFIX} Path '${discoveredPath.path}' is complete in AI cache.`)
      currentEnrichedData.set(key, existingEntry) // Preserve complete existing entry
    }
  }

  // 4. Get AI suggestions for needy nodes
  const aiSuggestions = await getAiSuggestionsForNodes(nodesForAI) // Map<string(originalPath), AISuggestion>

  // 5. Merge AI suggestions into currentEnrichedData and update AI cache object
  let newItemsForCacheCount = 0
  const finalNavObjectForCache: Record<string, NavItem> = { ...aiCache } // Start with old cache

  for (const discoveredPath of flatDiscoveredPaths) {
    const key = pathToSnakeCaseKey(discoveredPath.path) // Snake_case key for storage
    const suggestion = aiSuggestions.get(discoveredPath.path) // Look up by original full path

    if (suggestion) {
      logger.info(`${LOG_PREFIX} Applying AI suggestion for path: ${discoveredPath.path}`)
      const newItem: NavItem = {
        href: discoveredPath.path,
        title: suggestion.title,
        description: suggestion.description,
        emoji: suggestion.emoji,
      }
      finalNavObjectForCache[key] = newItem
      currentEnrichedData.set(key, newItem) // Also update our working map
      newItemsForCacheCount++
    } else if (!currentEnrichedData.has(key)) {
      // No existing complete entry, and no new AI suggestion (either AI failed or not requested)
      // Create a basic entry
      logger.warn(`${LOG_PREFIX} No AI suggestion for '${discoveredPath.path}'. Using default name: '${discoveredPath.name}'.`)
      const basicItem: NavItem = {
        href: discoveredPath.path,
        title: discoveredPath.name, // Default name from file system discovery
      }
      finalNavObjectForCache[key] = basicItem
      currentEnrichedData.set(key, basicItem)
    }
    // If currentEnrichedData already had it from a complete cache entry, it's fine.
  }
  
  // Apply manual overrides to the flat data before building tree and saving cache
  // Example:
  const patientDashboardKey = pathToSnakeCaseKey('/patient')
  if (finalNavObjectForCache[patientDashboardKey]) {
      if (finalNavObjectForCache[patientDashboardKey].title !== 'Patient Dashboard') {
        logger.info(`Applying manual title override for /patient. Old: ${finalNavObjectForCache[patientDashboardKey].title}`)
        finalNavObjectForCache[patientDashboardKey].title = 'Patient Dashboard' // Override title
        finalNavObjectForCache[patientDashboardKey].emoji = '🧑‍⚕️' 
        currentEnrichedData.set(patientDashboardKey, finalNavObjectForCache[patientDashboardKey])
      }
  }
  // Add more overrides as needed

  if (newItemsForCacheCount > 0 || Object.keys(finalNavObjectForCache).length !== Object.keys(aiCache).length) {
    logger.info(`${LOG_PREFIX} Updating AI cache file with ${newItemsForCacheCount} new/updated AI suggestions.`)
    saveAiCache(finalNavObjectForCache)
  } else {
    logger.info(`${LOG_PREFIX} AI cache is up-to-date. No changes saved.`)
  }

  // 6. Build the final hierarchical route tree (using the map keyed by snake_case)
  // The buildHierarchicalRouteTreeRecursive needs to be initiated with the root of the *discovered* structure.
  
  const enrichedDataForTree = new Map<string, NavItem>() // This map should be keyed by snake_case path
  Object.entries(finalNavObjectForCache).forEach(([key, navItem]) => {
    enrichedDataForTree.set(key, navItem)
  })
  
  let finalRouteTree: RouteNode | null = null
  if (discoveredRoot && (discoveredRoot.isPage || (discoveredRoot.children && discoveredRoot.children.length > 0))) {
    finalRouteTree = buildHierarchicalRouteTreeRecursive(discoveredRoot, enrichedDataForTree)
  } else {
    logger.warn("Root discovery didn't yield a page or children, final tree might be empty or null.")
    // Create a minimal root if nothing else, so the file isn't empty/invalid
     finalRouteTree = {
        name: 'root',
        path: '/',
        isDynamic: false,
        title: 'Home',
        children: {}
    }
  }

  if (!finalRouteTree) { // Ensure there's always a root object for the output file
    logger.warn(`${LOG_PREFIX} Final route tree is null, creating a default empty root.`)
    finalRouteTree = {
        name: 'root',
        path: '/',
        isDynamic: false,
        title: 'Home', // Default title for root if nothing else
        children: {}
    }
  }
  
  logger.info(`${LOG_PREFIX} Generated hierarchical route tree.`)

  // 7. Write the hierarchical route tree to config/routeTree.ts
  const outputContent = `// Generated route tree - do not edit manually
// This file is generated by scripts/${path.basename(__filename)}

// IMPORTANT: This structure is derived from the file system and enriched
// with title, description, and emoji from AI (cached in lib/${AI_CACHE_FILENAME}).

export const routeTree = ${JSON.stringify(finalRouteTree, null, 2)} as const;

// Re-exporting the RouteNode type for convenience in other parts of the app
export type { RouteNode } from './${path.basename(__filename).replace('.ts','')}'; 
// Note: Above assumes RouteNode is exported from this file itself. If it's in a types file, adjust path.
// For simplicity, RouteNode is defined and exported in this file.
`;

  const routeTreeOutputPath = path.resolve(process.cwd(), 'config', 'routeTree.ts');
  const routeTreeOutputDir = path.dirname(routeTreeOutputPath);
  if (!fs.existsSync(routeTreeOutputDir)) {
    fs.mkdirSync(routeTreeOutputDir, { recursive: true });
  }
  fs.writeFileSync(routeTreeOutputPath, outputContent, 'utf8');
  logger.info(`${LOG_PREFIX} Hierarchical route tree saved to ${path.relative(process.cwd(), routeTreeOutputPath)}`)

  logger.info(`${LOG_PREFIX} Route tree generation finished successfully!`)
}

main().catch(error => {
  logger.error(`${LOG_PREFIX} Critical error during route tree generation:`, { error });
  process.exit(1);
});

// Make sure RouteNode is exported if referenced in the output string like that.
// If RouteNode definition is kept inside this file, it's fine.
// If moved to types, the template string for output needs to adjust import path.
// For now, it's defined above. 