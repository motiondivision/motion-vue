import { expect, test } from '@playwright/test'

/**
 * Tests for Reorder page-level auto-scroll: when the Reorder container has
 * no overflow:auto/scroll ancestor, dragging near the viewport edge scrolls
 * the page itself.
 */
test.describe('Reorder page scroll', () => {
  test('scrolls the page when dragging near the viewport bottom edge', async ({ page }) => {
    await page.goto('/reorder/page-scroll')
    await page.waitForTimeout(200)

    const initialScroll = await page.evaluate(() => window.scrollY)
    expect(initialScroll).toBe(0)

    const item0 = page.locator('[data-testid="p-0"]')
    const box = await item0.boundingBox()
    expect(box).not.toBeNull()

    const startX = box!.x + box!.width / 2
    const startY = box!.y + box!.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.waitForTimeout(50)

    // Initiate the drag, then move to just above the viewport bottom edge
    const viewportHeight = page.viewportSize()!.height
    await page.mouse.move(startX, startY + 30, { steps: 5 })
    await page.mouse.move(startX, viewportHeight - 20, { steps: 10 })
    await page.waitForTimeout(300)

    const afterScroll = await page.evaluate(() => window.scrollY)
    expect(afterScroll).toBeGreaterThan(0)

    await page.mouse.up()
  })
})
