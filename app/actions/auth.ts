"use server"

import { PrismaClient } from "@prisma/client"


const prisma = new PrismaClient()

export async function loginAsDemoUser() {
  if (process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")) {
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

      return { success: true, session }
    } catch (error) {
      console.error("Failed to create demo user:", error)
      return { success: false, error: "Failed to create demo user" }
    }
  }

  return { success: false, error: "Demo login is only available in development" }
}
