import { SharingLevel } from "@prisma/client"
import * as z from "zod"

export const agentSchema = z.object({
  name: z.string().min(3).max(64),
  description: z.string().min(3).max(500).optional(),
  prompt: z.string().optional(),
  initialMessage: z.string().optional(),
  avatar: z.string().optional(),
  conversationStarters: z.array(z.object({ text: z.string() })).nonempty(),
  sharingLevel: z.enum([SharingLevel.PRIVATE, 
    SharingLevel.UNPUBLISHED_LINK, SharingLevel.PUBLISHED]).optional()
})

export const agentCreateUpdateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  initialMessage: z.string().optional(),
  prompt: z.string().optional(),
  avatar: z.string().optional(),
  conversationStarters: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional().optional(),
  datasources: z.array(z.string()).optional(),
  sharingLevel: z.enum([SharingLevel.PRIVATE, 
    SharingLevel.UNPUBLISHED_LINK, SharingLevel.PUBLISHED]).optional()
})
