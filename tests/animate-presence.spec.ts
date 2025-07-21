import { expect, test } from '@playwright/test'

test.describe('AnimatePresence', () => {
  test('AnimatePresence test', async ({ page }) => {
    await page.goto('/animate-presence')

    const toggle = await page.waitForSelector('#toggle')

    await toggle.click()

    const animatePresenceItem = await page.waitForSelector('#animate-presence-item')

    await expect(animatePresenceItem).toBeDefined()

    await toggle.click()
    await page.waitForTimeout(100)
    const opacity = await animatePresenceItem?.evaluate(el => window.getComputedStyle(el).opacity)
    expect(+opacity).toBeLessThan(1)
    expect(await animatePresenceItem.isVisible()).toBe(true)
    await page.waitForTimeout(400)
    expect(await animatePresenceItem.isVisible()).toBe(false)
  })
})
