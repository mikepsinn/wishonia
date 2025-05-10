import { test, expect } from '@playwright/test'

// Use API render context to perform login via credentials API

test.describe('Demo Login', () => {
  test('should login with demo user in development', async ({ page }) => {
    // Perform demo login via API and set cookie
    const demoSession = { user: { id: 'demo-user-id', name: 'Demo User', email: 'demo@example.com' } }
    const response = await page.request.post('http://localhost:3000/api/auth/callback/credentials', {
      form: { session: JSON.stringify(demoSession) }
    })
    expect(response.ok()).toBeTruthy()
    const setCookie = response.headers()['set-cookie']
    const match = /next-auth\.session-token=([^;]+);/.exec(setCookie || '')
    expect(match).toBeTruthy()
    const token = match![1]
    await page.context().addCookies([{
      name: 'next-auth.session-token', value: token, domain: 'localhost', path: '/'
    }])

    // Navigate to home page and verify login
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')

    // Verify we're logged in by checking for the demo user's name
    const userInfo = page.getByText('Demo User')
    await expect(userInfo).toBeVisible({ timeout: 10000 })
  })
})
