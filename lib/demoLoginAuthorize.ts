// Helper for demo credentials provider
export async function demoLoginAuthorize(credentials?: { session?: string }) {
  if (!credentials?.session) return null
  try {
    const sessionData = JSON.parse(credentials.session)
    return {
      id: sessionData.user.id,
      name: sessionData.user.name,
      email: sessionData.user.email,
      image: null,
    }
  } catch (error) {
    console.error('Demo login error:', error)
    return null
  }
}
