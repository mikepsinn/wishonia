import { test, expect } from '@playwright/test'

test.describe('Demo Login', () => {
  test('should login with demo user in development', async ({ page }) => {
    // Set longer timeout for the test
    test.setTimeout(60000)

    // Go to the signin page
    await page.goto('http://localhost:3000/signin')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    await page.waitForLoadState('domcontentloaded')

    // Intercept the credentials request and inject demo session
    await page.route('**/api/auth/callback/credentials*', async route => {
      const demoSession = {
        user: {
          id: 'demo-user-id',
          name: 'Demo User',
          email: 'demo@example.com'
        }
      }
      
      // Modify the request to include the demo session
      const request = route.request()
      await route.continue({
        postData: JSON.stringify({ session: JSON.stringify(demoSession) })
      })
    })

    // Log all buttons on the page
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    console.log('Found', buttonCount, 'buttons on the page')
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      console.log('Button', i, ':', 
        'text=', await button.textContent(),
        'role=', await button.getAttribute('role'),
        'type=', await button.getAttribute('type'),
        'aria-label=', await button.getAttribute('aria-label')
      )
    }

    // Use exact button text
    const demoButton = page.getByRole('button', { name: 'Demo Login (Development Only)' })
    
    // Wait for button with increased timeout
    await expect(demoButton).toBeVisible({ timeout: 10000 })
    
    // Click the button and wait for auth request
    await Promise.all([
      page.waitForResponse('**/api/auth/callback/credentials*'),
      demoButton.click()
    ])

    // Wait for navigation away from signin
    await page.waitForURL('http://localhost:3000/**', { timeout: 30000 })
    console.log('Current URL after redirect:', page.url())

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')
    await page.waitForLoadState('domcontentloaded')

    // Log the current URL and page content
    console.log('Current URL:', page.url())
    const pageContent = await page.textContent('body')
    console.log('Page content:', pageContent?.substring(0, 200))

    // Try to find the user info in different ways
    const selectors = [
      'text=Demo User',
      '[aria-label*="user"]',
      '[data-testid="user-info"]',
      '.user-info',
      '#user-info'
    ]

    for (const selector of selectors) {
      const element = page.locator(selector)
      const isVisible = await element.isVisible().catch(() => false)
      console.log(`Checking selector '${selector}':`, isVisible ? 'Found' : 'Not found')
    }

    // Verify we're logged in by checking for the demo user's name
    const userInfo = page.getByText('Demo User')
    await expect(userInfo).toBeVisible({ timeout: 10000 })
  })
})
