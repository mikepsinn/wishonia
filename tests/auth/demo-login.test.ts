import { demoLoginAuthorize } from '@/lib/auth'

describe('demoLoginAuthorize', () => {
  it('should authorize with valid demo session data', async () => {
    const demoSession = {
      user: { id: 'demo-user-id', name: 'Demo User', email: 'demo@example.com' }
    }
    const result = await demoLoginAuthorize({ session: JSON.stringify(demoSession) })
    expect(result).toEqual({
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@example.com',
      image: null
    })
  })

  it('should reject missing session', async () => {
    const result = await demoLoginAuthorize({})
    expect(result).toBeNull()
  })

  it('should reject invalid JSON session', async () => {
    const result = await demoLoginAuthorize({ session: 'not json' })
    expect(result).toBeNull()
  })

  it('should reject session without user data', async () => {
    const result = await demoLoginAuthorize({ session: JSON.stringify({}) })
    expect(result).toBeNull()
  })
})
