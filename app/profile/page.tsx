import { redirect } from "next/navigation"
import ProfileForm from "./ProfileForm"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export default async function ProfilePage() {
    const session = await requireAuth({ returnTo: true })
    
    if (!session.user?.email) {
        redirect("/")
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            userSkills: {
                include: {
                    skill: true
                }
            }
        }
    })

    if (!dbUser) {
        return <div>User not found</div>
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
            <ProfileForm user={dbUser} />
        </div>
    )
}