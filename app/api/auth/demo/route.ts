import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST() {
  if (!process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")) {
    return NextResponse.json(
      { error: "Demo login is only available in development" },
      { status: 403 }
    )
  }

  try {
    // Check if demo user exists
    let demoUser = await prisma.user.findFirst({
      where: {
        email: "demo@wishonia.local",
      },
    })

    // Create demo user if it doesn't exist
    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          name: "Demo User",
          email: "demo@wishonia.local",
          emailVerified: new Date(),
          image: null,
        },
      })
    }

    // Create a session for the demo user
    const session = {
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        image: null,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    }

    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error("Failed to create demo user:", error)
    return NextResponse.json(
      { error: "Failed to create demo user" },
      { status: 500 }
    )
  }
}
