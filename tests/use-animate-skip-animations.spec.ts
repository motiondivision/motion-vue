import { expect, test } from '@playwright/test'

test.describe('useAnimate with MotionConfig skipAnimations', () => {
  test('applies final value instantly without active browser animations', async ({ page }) => {
    await page.goto('/use-animate-skip-animations')

    const target = page.locator('[data-testid="skip-animations-target"]')
    await page.waitForTimeout(50)

    expect(await target.evaluate(el => window.getComputedStyle(el).opacity)).toBe('0.5')
    expect(await target.evaluate(el => el.getAnimations().length)).toBe(0)
  })
})
