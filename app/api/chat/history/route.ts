import { NextResponse } from "next/server"
import { auth } from "@/auth" // Assuming auth setup provides user session
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 })
    }

    // Find chat sessions associated with the agentId and userId
    const chats = await prisma.chat.findMany({
      where: {
        agentId: agentId,
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc", // Order messages within each chat session
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Order chat sessions themselves, if multiple
      },
    })

    // Combine all messages from all relevant chat sessions into a single flat list
    // and transform them into the VercelMessage format.
    const allMessages: {
      id: string
      role: "user" | "assistant" | "system" | "function" | "data" | "tool" // Match VercelMessage roles
      content: string
      createdAt: Date
    }[] = []

    for (const chat of chats) {
      for (const msg of chat.messages) {
        allMessages.push({
          id: msg.id,
          // Ensure the role from DB (MessageRole) is compatible with VercelMessage role
          // This might need a mapping if the enums are different. For now, direct cast.
          role: msg.role as "user" | "assistant" | "system" | "function" | "data" | "tool",
          content: msg.content,
          createdAt: msg.createdAt,
        })
      }
    }
    
    // Sort all combined messages by createdAt to ensure chronological order across chats
    allMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return NextResponse.json(allMessages)
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
