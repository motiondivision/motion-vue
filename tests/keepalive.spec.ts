import { expect, test } from '@playwright/test'

test.describe('KeepAlive presence', () => {
  test('switch plays the exit in place before the panel moves to storage', async ({ page }) => {
    await page.goto('/keepalive', { waitUntil: 'domcontentloaded' })

    const stage = page.locator('.stage').nth(1)
    const panelA = stage.locator('.panel-a')
    await expect(panelA).toBeVisible()
    const el = await panelA.elementHandle()

    await page.locator('#s2-toggle').click()
    await page.waitForTimeout(150)

    expect(await el!.evaluate(node => node.isConnected)).toBe(true)
    const opacity = await el!.evaluate(node => window.getComputedStyle(node).opacity)
    expect(+opacity).toBeLessThan(1)

    await page.waitForTimeout(1200)
    expect(await el!.evaluate(node => node.isConnected)).toBe(false)
  })

  /**
   * `<KeepAlive><AnimatePresence><component :is="...">` only sees a removal
   * when the swapped components carry distinct keys. Without them both
   * children fall back to the same generated key, so the core reads the swap
   * as one child changing contents: no exit runs and the outgoing panel stays.
   */
  test('exits the outgoing panel when the cached component is swapped', async ({ page }) => {
    await page.goto('/keepalive', { waitUntil: 'domcontentloaded' })

    const stage = page.locator('.stage').nth(0)
    await expect(stage.locator('.panel-a')).toBeVisible()

    await page.locator('#s1-toggle').click()

    // The outgoing panel must animate out, not sit at full opacity.
    await page.waitForTimeout(200)
    const outgoing = stage.locator('.panel-a')
    expect(await outgoing.count()).toBe(1)
    const opacity = await outgoing.evaluate(node => +window.getComputedStyle(node).opacity)
    expect(opacity).toBeLessThan(1)

    // mode="wait": it leaves the DOM before the incoming panel shows.
    await expect(stage.locator('.panel-b')).toHaveCount(1)
    await expect(stage.locator('.panel-a')).toHaveCount(0)
    await expect(stage.locator('.panel-b')).toHaveCSS('opacity', '1')
  })
})
