import { CreatePetitionForm } from "../components/CreatePetitionForm"
import { requireAuth } from "@/lib/auth"

export default async function CreatePetitionPage() {
  await requireAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create a Petition</h1>
      <CreatePetitionForm />
    </div>
  )
} 