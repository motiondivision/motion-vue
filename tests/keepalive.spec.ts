import { expect, test } from '@playwright/test'

test.describe('KeepAlive presence', () => {
  test('switch plays the exit in place before the panel moves to storage', async ({ page }) => {
    await page.goto('/keepalive', { waitUntil: 'domcontentloaded' })

    // S2 caches a component whose own root is AnimatePresence + motion.div.
    const stage = page.locator('.stage').nth(1)
    const panelA = stage.locator('.panel-a')
    await expect(panelA).toBeVisible()
    // KeepAlive moves the deactivated subtree into a detached container, so
    // later checks must go through a handle rather than a document locator.
    const el = await panelA.elementHandle()

    await page.locator('#s2-toggle').click()
    await page.waitForTimeout(150)

    // Exit is running: the panel is still in the document.
    expect(await el!.evaluate(node => node.isConnected)).toBe(true)
    const opacity = await el!.evaluate(node => window.getComputedStyle(node).opacity)
    expect(+opacity).toBeLessThan(1)

    // Exit settled: Transition released the storage move.
    await page.waitForTimeout(1200)
    expect(await el!.evaluate(node => node.isConnected)).toBe(false)
  })
})
