import { expect, test } from '@playwright/test'

// This test assumes the Vite dev server is running and the route is /dynamic-variant

test.describe('Variant', () => {
  test('should animate opacity when variant changes', async ({ page }) => {
    await page.goto('/dynamic-variant')
    const motionBtn = page.locator('[data-testid="motion-btn"]')
    // Initial: visible
    await expect(motionBtn).toHaveCSS('opacity', '1')
    // Click toggle
    await page.click('[data-testid="toggle-btn"]')
    // After: hidden
    await page.waitForTimeout(250)
    await expect(motionBtn).toHaveCSS('opacity', '0.25')
    // Click toggle again
    await page.click('[data-testid="toggle-btn"]')
    await page.waitForTimeout(250)
    await expect(motionBtn).toHaveCSS('opacity', '1')
  })
})
