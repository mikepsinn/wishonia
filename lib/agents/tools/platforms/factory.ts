import { Tool, ToolType, PlatformCredential } from '@prisma/client'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { createGitHubTool } from './github'
import { BasePlatformTool } from './base'
import { CoreTool } from 'ai'

type PlatformTool = ReturnType<typeof createGitHubTool>

export class PlatformToolFactory {
  // Create a new platform tool instance
  static async createTool(toolType: ToolType, userId: string, name: string, description: string): Promise<PlatformTool> {
    // Get or create credentials
    const credential = await BasePlatformTool.getOrCreateCredential(userId, toolType)

    // Create tool record
    const tool = await prisma.tool.create({
      data: {
        name,
        description,
        type: toolType,
        userId,
        credentialId: credential.id
      }
    })

    return this.initializeTool(tool, credential)
  }

  // Initialize an existing tool
  static async initializeTool(tool: Tool, credential?: PlatformCredential): Promise<PlatformTool> {
    let resolvedCredential = credential
    if (!resolvedCredential && tool.credentialId) {
      const foundCredential = await prisma.platformCredential.findUnique({
        where: { id: tool.credentialId }
      })
      if (!foundCredential) {
        throw new Error('No credentials found for platform tool')
      }
      resolvedCredential = foundCredential
    }

    if (!resolvedCredential) {
      throw new Error('No credentials found for platform tool')
    }

    const config = { tool, credential: resolvedCredential }

    switch (tool.type) {
      case ToolType.GITHUB_APP:
        return createGitHubTool(config)
      // Add cases for other platforms
      // case ToolType.DISCORD:
      //   return createDiscordTool(config)
      // case ToolType.TWITTER:
      //   return createTwitterTool(config)
      default:
        logger.error('Unsupported platform tool type', { type: tool.type })
        throw new Error(`Unsupported platform tool type: ${tool.type}`)
    }
  }

  // Get all platform tools for a user
  static async getUserTools(userId: string): Promise<PlatformTool[]> {
    const tools = await prisma.tool.findMany({
      where: {
        userId,
        type: {
          in: [
            ToolType.GITHUB_APP,
            ToolType.DISCORD,
            ToolType.TELEGRAM,
            ToolType.TWITTER,
            ToolType.LINKEDIN,
            ToolType.SLACK,
            ToolType.WHATSAPP,
            ToolType.EMAIL,
            ToolType.SMS
          ]
        }
      },
      include: {
        platformCredential: true
      }
    })

    return Promise.all(
      tools.map(async tool => {
        if (!tool.platformCredential) {
          throw new Error(`No credentials found for tool ${tool.id}`)
        }
        return this.initializeTool(tool, tool.platformCredential)
      })
    )
  }

  // Get a specific platform tool for a user
  static async getUserTool(userId: string, toolType: ToolType): Promise<PlatformTool | null> {
    const tool = await prisma.tool.findFirst({
      where: {
        userId,
        type: toolType
      },
      include: {
        platformCredential: true
      }
    })

    if (!tool || !tool.platformCredential) {
      return null
    }

    return this.initializeTool(tool, tool.platformCredential)
  }

  // Delete a platform tool and its credentials
  static async deleteTool(toolId: string): Promise<void> {
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        platformCredential: true
      }
    })

    if (!tool) {
      throw new Error('Tool not found')
    }

    // Delete the tool first
    await prisma.tool.delete({
      where: { id: toolId }
    })

    // If this was the last tool using these credentials, delete them too
    if (tool.credentialId) {
      const otherTools = await prisma.tool.findFirst({
        where: {
          credentialId: tool.credentialId
        }
      })

      if (!otherTools) {
        await prisma.platformCredential.delete({
          where: { id: tool.credentialId }
        })
      }
    }
  }
} 