import { PlatformCredential, Tool, ToolType } from '@prisma/client'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export interface PlatformToolConfig {
  tool: Tool
  credential: PlatformCredential
}

export enum ActionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export abstract class BasePlatformTool {
  protected tool: Tool
  protected credential: PlatformCredential

  constructor(config: PlatformToolConfig) {
    this.tool = config.tool
    this.credential = config.credential
  }

  // Get or create platform credentials for a user
  static async getOrCreateCredential(userId: string, platform: ToolType): Promise<PlatformCredential> {
    return prisma.platformCredential.upsert({
      where: {
        userId_platform: {
          userId,
          platform
        }
      },
      create: {
        userId,
        platform
      },
      update: {}
    })
  }

  // Create a new platform action record
  protected async createPlatformAction(actionType: string, requestData: any) {
    return prisma.platformAction.create({
      data: {
        toolId: this.tool.id,
        agentId: this.tool.userId,
        platform: this.tool.type,
        actionType,
        status: ActionStatus.IN_PROGRESS,
        requestData
      }
    })
  }

  // Update a platform action record
  protected async updatePlatformAction(actionId: string, status: ActionStatus.COMPLETED | ActionStatus.FAILED, responseData?: any, errorMessage?: string) {
    return prisma.platformAction.update({
      where: { id: actionId },
      data: {
        status,
        responseData,
        errorMessage,
        completedAt: new Date()
      }
    })
  }

  // Validate and refresh credentials if needed
  protected async validateCredentials(): Promise<boolean> {
    if (!this.credential) {
      logger.error('No credentials found for platform', { platform: this.tool.type })
      return false
    }

    // Check if credentials are expired
    if (this.credential.expiresAt && this.credential.expiresAt < new Date()) {
      try {
        await this.refreshCredentials()
      } catch (error) {
        logger.error('Failed to refresh credentials', { error, platform: this.tool.type })
        return false
      }
    }

    return true
  }

  // Refresh OAuth tokens if supported by the platform
  protected async refreshCredentials(): Promise<void> {
    if (!this.credential.refreshToken) {
      throw new Error('No refresh token available')
    }

    // This should be implemented by platform-specific classes
    throw new Error('refreshCredentials() not implemented')
  }

  // Execute an action with error handling and logging
  protected async executeAction<T>(
    actionType: string,
    requestData: any,
    action: () => Promise<T>
  ): Promise<T> {
    const platformAction = await this.createPlatformAction(actionType, requestData)

    try {
      const isValid = await this.validateCredentials()
      if (!isValid) {
        throw new Error('Invalid credentials')
      }

      const result = await action()

      await this.updatePlatformAction(platformAction.id, ActionStatus.COMPLETED, result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Platform action failed', { error, actionType, platform: this.tool.type })
      await this.updatePlatformAction(platformAction.id, ActionStatus.FAILED, null, errorMessage)
      throw error
    }
  }
} 