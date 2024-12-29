import { ToolType } from '@prisma/client'
import { z } from 'zod'
import { BasePlatformTool, PlatformToolConfig } from './base'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/db'
import { tool } from 'ai'

// Schema for GitHub repository operations
export const githubCreateRepoSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  private: z.boolean().optional(),
  autoInit: z.boolean().optional(),
  gitignoreTemplate: z.string().optional(),
  licenseTemplate: z.string().optional()
})

export const githubCreatePRSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  title: z.string(),
  body: z.string(),
  head: z.string(),
  base: z.string().optional(),
  draft: z.boolean().optional()
})

// Combined schema for all GitHub operations
export const githubToolSchema = z.object({
  operation: z.enum(['create_repo', 'create_pr', 'create_file', 'get_contents']),
  params: z.union([
    githubCreateRepoSchema,
    githubCreatePRSchema,
    z.object({
      owner: z.string(),
      repo: z.string(),
      path: z.string(),
      content: z.string().optional(),
      message: z.string().optional()
    })
  ])
})

export class GitHubTool extends BasePlatformTool {
  constructor(config: PlatformToolConfig) {
    super(config)
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.credential.accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
  }

  async createRepository(params: z.infer<typeof githubCreateRepoSchema>) {
    return this.executeAction('create_repo', params, async () => {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`Failed to create repository: ${await response.text()}`)
      }

      return response.json()
    })
  }

  async createPullRequest(params: z.infer<typeof githubCreatePRSchema>) {
    const { owner, repo, ...prParams } = params
    return this.executeAction('create_pr', params, async () => {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(prParams)
      })

      if (!response.ok) {
        throw new Error(`Failed to create pull request: ${await response.text()}`)
      }

      return response.json()
    })
  }

  async createFile(owner: string, repo: string, path: string, content: string, message: string) {
    return this.executeAction('create_file', { owner, repo, path, message }, async () => {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({
            message,
            content: Buffer.from(content).toString('base64')
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to create file: ${await response.text()}`)
      }

      return response.json()
    })
  }

  async getRepoContents(owner: string, repo: string, path: string = '') {
    return this.executeAction('get_contents', { owner, repo, path }, async () => {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: this.getHeaders()
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to get repository contents: ${await response.text()}`)
      }

      return response.json()
    })
  }

  protected async refreshCredentials(): Promise<void> {
    if (!this.credential.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.credential.clientId,
          client_secret: this.credential.clientSecret,
          refresh_token: this.credential.refreshToken,
          grant_type: 'refresh_token'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      
      // Update credentials in database
      await this.updateCredentials({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000)
      })
    } catch (error) {
      logger.error('Failed to refresh GitHub credentials', { error })
      throw error
    }
  }

  private async updateCredentials(data: {
    accessToken: string
    refreshToken: string
    expiresAt: Date
  }) {
    const updated = await prisma.platformCredential.update({
      where: {
        id: this.credential.id
      },
      data
    })
    this.credential = updated
  }
}

// Create a tool wrapper that can be used by any agent
export function createGitHubTool(config: PlatformToolConfig) {
  const githubTool = new GitHubTool(config)

  return {
    name: 'github',
    description: 'Interact with GitHub repositories. Can create repositories, pull requests, and manage files.',
    parameters: githubToolSchema,
    execute: async ({ operation, params }: z.infer<typeof githubToolSchema>) => {
      switch (operation) {
        case 'create_repo':
          return githubTool.createRepository(params as z.infer<typeof githubCreateRepoSchema>)
        case 'create_pr':
          return githubTool.createPullRequest(params as z.infer<typeof githubCreatePRSchema>)
        case 'create_file':
          const { owner, repo, path, content, message } = params as any
          return githubTool.createFile(owner, repo, path, content, message || 'Add file')
        case 'get_contents':
          const { owner: o, repo: r, path: p } = params as any
          return githubTool.getRepoContents(o, r, p)
        default:
          throw new Error(`Unknown GitHub operation: ${operation}`)
      }
    }
  }
} 