import { Suspense } from 'react'
import { GitHubExplorer } from '@/components/github/GitHubExplorer'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export default async function GitHubPage() {
  const session = await requireAuth({ returnTo: true })

  async function getAccessToken() {
    'use server'
    try {
      console.log('Fetching GitHub access token for user:', session.user.id)
      const accounts = await prisma?.account.findMany({
        where: { userId: session.user.id, provider: 'github' },
        select: {
          access_token: true,
          scope: true,
          token_type: true,
          createdAt: true,
          updatedAt: true,
        }
      })
      
      console.log('Found GitHub accounts:', accounts.length)
      accounts.forEach((acc, i) => {
        console.log(`Account ${i + 1}:`, {
          scopes: acc.scope?.split(' '),
          tokenType: acc.token_type,
          createdAt: acc.createdAt,
          updatedAt: acc.updatedAt,
          tokenPreview: acc.access_token ? `${acc.access_token.slice(0, 4)}...` : 'none'
        })
      })

      const requiredScopes = ['read:org', 'repo']
      const githubAccount = accounts.find(acc => 
        requiredScopes.every(scope => 
          acc.scope?.includes(scope)
        )
      )
      
      if (githubAccount) {
        console.log('Found GitHub account with required scopes:', {
          scopes: githubAccount.scope?.split(' '),
          tokenType: githubAccount.token_type,
          createdAt: githubAccount.createdAt,
          updatedAt: githubAccount.updatedAt,
          tokenPreview: githubAccount.access_token ? 
            `${githubAccount.access_token.slice(0, 4)}...` : 
            'none'
        })
      } else {
        console.log('No GitHub account found with required scopes:', requiredScopes)
      }
      
      return githubAccount?.access_token ?? null
    } catch (error) {
      console.error('Error fetching GitHub access token:', error)
      return null
    }
  }

  const accessToken = await getAccessToken()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">GitHub Explorer</h1>
      <Suspense fallback={<div>Loading...</div>}>
        {accessToken ? (
          <GitHubExplorer accessToken={accessToken} />
        ) : (
          <p>No GitHub access token found.</p>
        )}
      </Suspense>
    </div>
  )
}
