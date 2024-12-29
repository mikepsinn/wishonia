import { z } from "zod"
import { ToolType } from "@prisma/client"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

const credentialSchema = z.object({
  agentId: z.string().optional(),
  platform: z.string(),
  name: z.string(),
  accessToken: z.string()
})

export type PlatformCredentialInfo = {
  id: string
  platform: ToolType
  name: string
  accessToken: string
}

export async function addPlatformCredential(data: {
  agentId?: string
  platform: ToolType
  name: string
  accessToken: string
}): Promise<PlatformCredentialInfo> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    const credential = await prisma.platformCredential.create({
      data: {
        platform: data.platform,
        name: data.name,
        accessToken: data.accessToken,
        userId: user.id,
        ...(data.agentId ? {
          agents: {
            create: {
              agentId: data.agentId
            }
          }
        } : {})
      },
      select: {
        id: true,
        platform: true,
        name: true,
        accessToken: true
      }
    })

    revalidatePath('/agents')
    return credential
  } catch (error) {
    console.error("Failed to create platform credential:", error)
    throw new Error("Failed to create platform credential")
  }
}

export async function removePlatformCredential(credentialId: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    // First check if the credential belongs to the user
    const credential = await prisma.platformCredential.findFirst({
      where: {
        id: credentialId,
        userId: user.id
      }
    })

    if (!credential) {
      throw new Error("Credential not found")
    }

    await prisma.platformCredential.delete({
      where: {
        id: credentialId
      }
    })

    revalidatePath('/agents')
  } catch (error) {
    console.error("Failed to delete platform credential:", error)
    throw new Error("Failed to delete platform credential")
  }
}

export async function getPlatformCredentials(agentId?: string): Promise<PlatformCredentialInfo[]> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    return await prisma.platformCredential.findMany({
      where: {
        userId: user.id,
        ...(agentId ? {
          agents: {
            some: {
              agentId
            }
          }
        } : {})
      },
      select: {
        id: true,
        platform: true,
        name: true,
        accessToken: true
      }
    })
  } catch (error) {
    console.error("Failed to fetch platform credentials:", error)
    throw new Error("Failed to fetch platform credentials")
  }
} 