import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth"
import { PetitionSignature } from "@prisma/client"

type PetitionWithCount = {
  id: string
  title: string
  _count: {
    signatures: number
  }
}

type SignatureWithPetition = PetitionSignature & {
  petition: PetitionWithCount
  user: {
    name: string | null
    email: string | null
  }
}

export default async function MyReferralsPage() {
  const session = await requireAuth({ returnTo: true })

  const referrals = await prisma.petitionSignature.findMany({
    where: {
      referrerId: session.user.id,
    },
    include: {
      petition: {
        select: {
          id: true,
          title: true,
          _count: {
            select: { signatures: true }
          }
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { signedAt: 'desc' }
  })

  const referralsByPetition = (referrals as SignatureWithPetition[]).reduce((acc, ref) => {
    const petitionId = ref.petition.id
    if (!acc[petitionId]) {
      acc[petitionId] = {
        petition: ref.petition,
        referrals: []
      }
    }
    acc[petitionId].referrals.push(ref)
    return acc
  }, {} as Record<string, { petition: PetitionWithCount, referrals: SignatureWithPetition[] }>)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Referrals</h1>

      {Object.values(referralsByPetition).length > 0 ? (
        <div className="space-y-8">
          {Object.values(referralsByPetition).map(({ petition, referrals }) => (
            <Card key={petition.id} className="p-6">
              <div className="mb-4">
                <Link 
                  href={`/petitions/${petition.id}`}
                  className="text-xl font-semibold hover:underline"
                >
                  {petition.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  {referrals.length} referral{referrals.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                  <label htmlFor={`share-link-${petition.id}`}>Share Link:</label>
                </div>
                <input
                  id={`share-link-${petition.id}`}
                  type="text"
                  readOnly
                  aria-label={`Share link for ${petition.title}`}
                  className="w-full p-2 bg-muted rounded text-sm"
                  value={`${process.env.NEXT_PUBLIC_APP_URL}/petitions/${petition.id}?ref=${session.user.id}`}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          You haven't referred anyone to petitions yet. Share petitions with your referral link to track your impact!
        </p>
      )}
    </div>
  )
} 