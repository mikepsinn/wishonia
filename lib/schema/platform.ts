import { z } from 'zod'
import { ToolType } from '@prisma/client'

// Base schema for all platform actions
export const platformActionSchema = z.object({
  platform: z.nativeEnum(ToolType).describe('The platform to perform the action on'),
  action: z.string().describe('The specific action to perform'),
  params: z.record(z.any()).describe('Parameters for the action')
})

// GitHub-specific schemas
export const githubCreateRepoSchema = z.object({
  platform: z.literal(ToolType.GITHUB_APP),
  action: z.literal('create_repo'),
  params: z.object({
    name: z.string().describe('Repository name'),
    description: z.string().optional().describe('Repository description'),
    private: z.boolean().default(false).describe('Whether the repository is private'),
    autoInit: z.boolean().default(true).describe('Initialize with README'),
    gitignoreTemplate: z.string().optional().describe('Gitignore template to use'),
    licenseTemplate: z.string().optional().describe('License template to use')
  })
})

export const githubCreatePRSchema = z.object({
  platform: z.literal(ToolType.GITHUB_APP),
  action: z.literal('create_pr'),
  params: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    title: z.string().describe('PR title'),
    body: z.string().describe('PR description'),
    head: z.string().describe('Head branch'),
    base: z.string().default('main').describe('Base branch'),
    draft: z.boolean().default(false).describe('Whether this is a draft PR')
  })
})

// Discord-specific schemas
export const discordSendMessageSchema = z.object({
  platform: z.literal(ToolType.DISCORD),
  action: z.literal('send_message'),
  params: z.object({
    channelId: z.string().describe('Discord channel ID'),
    content: z.string().describe('Message content'),
    embeds: z.array(z.any()).optional().describe('Message embeds')
  })
})

// Twitter-specific schemas
export const twitterPostSchema = z.object({
  platform: z.literal(ToolType.TWITTER),
  action: z.literal('post_tweet'),
  params: z.object({
    text: z.string().max(280).describe('Tweet text'),
    replyTo: z.string().optional().describe('Tweet ID to reply to'),
    mediaIds: z.array(z.string()).optional().describe('Media IDs to attach')
  })
})

// Combine all platform schemas
export const platformSchemas = z.discriminatedUnion('platform', [
  githubCreateRepoSchema,
  githubCreatePRSchema,
  discordSendMessageSchema,
  twitterPostSchema
]) 