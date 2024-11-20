'use server'

import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email"
import { getPetitionSignatureEmail } from "@/lib/emails/petition-signature"
import { notifyPetitionMilestone, notifyPetitionStatusUpdate, notifySignatureThreshold } from "@/lib/notifications/petition-notifications"
import { headers } from "next/headers"
import { z } from 'zod'
import { getModel } from "@/lib/utils/modelUtils"
import { generateObject } from "ai"
import { uploadImageToVercel } from '@/lib/imageUploader'
import { authOptions } from "@/lib/auth"

const PetitionGenerationSchema = z.object({
  title: z.string(),
  summary: z.string(),
  content: z.string(),
  messageTemplate: z.string(),
  callScript: z.string()
})

export async function signPetition(petitionId: string, referralSource?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Must be signed in to sign petitions")
  }

  let referrerId: string | null = null
  try {
    const headersList = headers()
    const referer = headersList.get('referer')
    if (referer) {
      const url = new URL(referer)
      referrerId = url.searchParams.get('ref')
    }
  } catch (error) {
    console.error('Failed to parse referrer:', error)
  }

  // Check if user has already signed
  const existingSignature = await prisma.petitionSignature.findUnique({
    where: {
      petitionId_userId: {
        petitionId,
        userId: session.user.id,
      }
    }
  })

  if (existingSignature) {
    throw new Error("You have already signed this petition")
  }

  // Create signature with referrer if valid
  const signature = await prisma.petitionSignature.create({
    data: {
      petitionId,
      userId: session.user.id,
      referrerId: referrerId || undefined,
      referralSource: referralSource,
    },
    include: {
      petition: {
        select: {
          title: true,
          targetCount: true,
          _count: { select: { signatures: true } }
        }
      }
    }
  })

  // Send thank you email
  if (session.user.email) {
    await sendEmail({
      to: session.user.email,
      subject: `Thank you for signing: ${signature.petition.title}`,
      html: getPetitionSignatureEmail({
        petitionTitle: signature.petition.title,
        petitionId,
        userId: session.user.id,
        baseUrl: process.env.NEXT_PUBLIC_APP_URL!
      })
    })
  }

  // Check for signature milestones
  const signatureCount = await prisma.petitionSignature.count({
    where: { petitionId }
  })

  // Check milestones
  const milestones = await prisma.petitionMilestone.findMany({
    where: {
      petitionId,
      reached: false,
      threshold: {
        lte: signatureCount
      }
    }
  })

  for (const milestone of milestones) {
    await prisma.petitionMilestone.update({
      where: { id: milestone.id },
      data: { 
        reached: true,
        reachedAt: new Date()
      }
    })

    await notifyPetitionMilestone(petitionId, milestone)
  }

  // Notify on round numbers (100, 1000, etc)
  if (signatureCount % 100 === 0) {
    await notifySignatureThreshold(petitionId, signatureCount)
  }

  // Check if petition reached target
  const totalSignatures = signature.petition._count.signatures + 1
  if (totalSignatures >= signature.petition.targetCount) {
    await prisma.petition.update({
      where: { id: petitionId },
      data: { status: 'SUCCESSFUL' }
    })
  }

  revalidatePath(`/petitions/${petitionId}`)
}

export async function addComment(petitionId: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Must be signed in to comment")
  }

  const comment = await prisma.petitionComment.create({
    data: {
      content,
      petitionId,
      userId: session.user.id,
    },
    include: {
      user: {
        select: { name: true, image: true }
      }
    }
  })

  const followers = await prisma.petitionFollow.findMany({
    where: {
      petitionId,
      user: {
        NOT: { id: session.user.id }
      }
    },
    include: {
      user: true,
      petition: true
    }
  })

  for (const follower of followers) {
    await sendEmail({
      to: follower.user.email!,
      subject: `New comment on petition: ${follower.petition.title}`,
      html: `
        <p>A new comment was added to a petition you're following:</p>
        <blockquote>${content}</blockquote>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/petitions/${petitionId}">View the petition</a>
      `
    })
  }

  revalidatePath(`/petitions/${petitionId}`)
  return comment
}

export async function followPetition(petitionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Must be signed in to follow")
  }

  await prisma.petitionFollow.create({
    data: {
      petitionId,
      userId: session.user.id,
    }
  })

  revalidatePath(`/petitions/${petitionId}`)
}

export async function unfollowPetition(petitionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Must be signed in to unfollow")
  }

  await prisma.petitionFollow.delete({
    where: {
      petitionId_userId: {
        petitionId,
        userId: session.user.id,
      }
    }
  })

  revalidatePath(`/petitions/${petitionId}`)
}

export async function createPetition(data: {
  title: string
  content: string
  summary: string
  imageUrl?: string
  targetCount: number
  messageTemplate?: string
  callScript?: string
  categoryId?: string
  tags?: string[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Must be signed in to create petitions")
  }

  const petition = await prisma.petition.create({
    data: {
      title: data.title,
      content: data.content,
      summary: data.summary,
      imageUrl: data.imageUrl,
      targetCount: data.targetCount,
      messageTemplate: data.messageTemplate,
      callScript: data.callScript,
      creatorId: session.user.id,
      tags: data.tags ? {
        connect: data.tags.map(id => ({ id }))
      } : undefined
    }
  })

  revalidatePath('/petitions')
  return petition
}

export async function createPetitionUpdate(petitionId: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Must be signed in to create updates")
  }

  // Verify user is petition creator
  const petition = await prisma.petition.findUnique({
    where: { id: petitionId }
  })

  if (petition?.creatorId !== session.user.id) {
    throw new Error("Only the petition creator can post updates")
  }

  const update = await prisma.petitionStatusUpdate.create({
    data: {
      petitionId,
      content
    }
  })

  await notifyPetitionStatusUpdate(petitionId, content)
  
  revalidatePath(`/petitions/${petitionId}`)
  return update
}

export async function updateFollowSettings(petitionId: string, settings: {
  notifyOnComment: boolean
  notifyOnMilestone: boolean
  notifyOnUpdate: boolean
  notifyOnSignature: boolean
  emailFrequency: 'INSTANT' | 'DAILY' | 'WEEKLY' | 'NEVER'
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Must be signed in to update settings")
  }

  await prisma.petitionFollow.update({
    where: {
      petitionId_userId: {
        petitionId,
        userId: session.user.id
      }
    },
    data: settings
  })

  revalidatePath(`/petitions/${petitionId}`)
}

export async function generatePetition(description: string) {
  'use server'
  
  console.log('Starting petition generation with description:', description)
  
  try {
    console.log('Calling generateObject...')
    const model = getModel()
    const result = await generateObject({
        model: model,
        schema: PetitionGenerationSchema,
        experimental_telemetry: { isEnabled: true },
        prompt: `You are an expert petition writer. Create compelling petitions that drive change.
          Given a description, create a petition with:
          - A compelling title that grabs attention
          - A clear summary that explains the issue
          - Detailed content in markdown format that makes a strong case
          - A template message for supporters to send
          - A phone call script for supporters to use
          
          Here is the description:
          ${description}
          `,
      })
    
    // Make sure we have a result before returning
    if (!result) {
      throw new Error('No result generated')
    }

    // Log the raw result to debug
    console.log('Raw generated result:', result)

    const petition = result.object
    console.log('Generated petition:', petition)

    // Validate the petition object
    if (!petition.title || !petition.summary || !petition.content) {
      throw new Error('Generated petition is missing required fields')
    }

    return petition
  } catch (error: unknown) {
    console.error('Detailed generation error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to generate petition: ${error.message}`)
    }
    throw new Error('Failed to generate petition: Unknown error')
  }
}

export async function uploadImage(formData: FormData) {
  console.log('Server: Starting image upload')
  try {
    const file = formData.get('image') as File
    if (!file) {
      console.error('Server: No file provided in formData')
      throw new Error('No file provided')
    }

    const folder = formData.get('folder') as string
    console.log('Server: Processing file for folder:', folder)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate path for the image
    const timestamp = Date.now()
    const path = `${folder}/${timestamp}-${file.name}`
    console.log('Server: Generated path:', path)

    // Upload the image
    const url = await uploadImageToVercel(buffer, path)
    console.log('Server: Upload successful, returning URL:', url)
    return { url }
  } catch (error) {
    console.error('Server: Failed to upload image:', error)
    throw new Error('Failed to upload image')
  }
}

export async function checkPetitionSignature(petitionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    console.log('No session user id')
    return false
  } else {
    console.log('Session user id:', session.user.id)
  }

  const signature = await prisma.petitionSignature.findUnique({
    where: {
      petitionId_userId: {
        petitionId,
        userId: session.user.id,
      }
    }
  })

  if (!signature) {
    console.log('No signature found')
  } else {
    console.log('Signature found')
  }

  return !!signature
}

export async function unsignPetition(petitionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Must be signed in to unsign petitions")
  }

  await prisma.petitionSignature.delete({
    where: {
      petitionId_userId: {
        petitionId,
        userId: session.user.id,
      }
    }
  })

  revalidatePath(`/petitions/${petitionId}`)
} 