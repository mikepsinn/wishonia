import { authOptions } from '@/lib/auth'

// Mock PrismaAdapter
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({}))
}))

// Mock Prisma client
jest.mock('@/lib/db', () => ({}))

describe('Demo Login Provider', () => {
  let credentialsProvider: any

  beforeEach(() => {
    credentialsProvider = authOptions.providers.find(
      (p) => p.id === 'credentials'
    )
    expect(credentialsProvider).toBeDefined()
  })

  it('should exist as a credentials provider', () => {
    expect(credentialsProvider.id).toBe('credentials')
    expect(credentialsProvider.name).toBe('Demo Login')
  })

  it('should authorize with valid demo session data', async () => {
    const provider = credentialsProvider as any
    const authorize = provider.authorize
    expect(authorize).toBeDefined()

    const demoSession = {
      user: {
        id: 'demo-user-id',
        name: 'Demo User',
        email: 'demo@example.com'
      }
    }

    const result = await authorize({
      session: JSON.stringify(demoSession)
    })

    expect(result).toEqual({
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@example.com',
      image: null
    })
  })

  it('should reject invalid session data', async () => {
    const provider = credentialsProvider as any
    const authorize = provider.authorize

    // Test with missing session
    const result1 = await authorize({})
    expect(result1).toBeNull()

    // Test with invalid JSON
    const result2 = await authorize({ session: 'invalid json' })
    expect(result2).toBeNull()

    // Test with missing user data
    const result3 = await authorize({ session: '{}' })
    expect(result3).toBeNull()
  })
})
