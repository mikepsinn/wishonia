import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth"
import { PetitionSignature } from "@prisma/client"

type PetitionWithCount = {
  id: string
  title: string
  status: string
  _count: {
    signatures: number
  }
}

type SignatureWithPetition = PetitionSignature & {
  petition: PetitionWithCount
}

export default async function MySignaturesPage() {
  const session = await requireAuth({ returnTo: true })

  const signatures = await prisma.petitionSignature.findMany({
    where: { userId: session.user.id },
    include: {
      petition: {
        select: {
          id: true,
          title: true,
          status: true,
          _count: {
            select: { signatures: true }
          }
        }
      }
    },
    orderBy: { signedAt: 'desc' }
  }) as SignatureWithPetition[]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Signatures</h1>

      {signatures.length > 0 ? (
        <div className="space-y-6">
          {signatures.map(({ petition }) => (
            <Card key={petition.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Link 
                    href={`/petitions/${petition.id}`}
                    className="text-xl font-semibold hover:underline"
                  >
                    {petition.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {petition._count.signatures} signature{petition._count.signatures !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="text-right">
                  <label htmlFor={`share-link-${petition.id}`} className="text-sm font-medium">Share:</label>
                  <input
                    id={`share-link-${petition.id}`}
                    type="text"
                    readOnly
                    aria-label={`Share link for ${petition.title}`}
                    className="w-96 p-2 text-sm bg-muted rounded mt-1"
                    value={`${process.env.NEXT_PUBLIC_APP_URL}/petitions/${petition.id}?ref=${session.user.id}`}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          You haven't signed any petitions yet.
        </p>
      )}
    </div>
  )
} 