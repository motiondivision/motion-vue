import { describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

/**
 * Tests for Reorder page-level auto-scroll: when the Reorder container has
 * no overflow:auto/scroll ancestor, dragging near the viewport edge scrolls
 * the page itself.
 */
describe('Reorder page scroll', () => {
  test('scrolls the page when dragging near the viewport bottom edge', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/reorder/page-scroll')

    const item0 = browser.locator('[data-testid="p-0"]')
    await expect(item0).toBeVisible()

    const initialScroll = await browser.evaluate(() => window.scrollY)
    expect(initialScroll).toBe(0)

    const box = await item0.boundingBox()
    expect(box).not.toBeNull()

    const startX = box!.x + box!.width / 2
    const startY = box!.y + box!.height / 2

    await browser.mouse.move(startX, startY)
    await browser.mouse.down()

    // Initiate the drag, then move to just above the viewport bottom edge
    const viewportHeight = await browser.evaluate(() => window.innerHeight)
    await browser.mouse.move(startX, startY + 30)
    await browser.mouse.move(startX, viewportHeight - 20)

    // Hold near the bottom edge until the page starts auto-scrolling
    await expect.poll(() => browser.evaluate(() => window.scrollY), { timeout: 5000 }).toBeGreaterThan(0)

    await browser.mouse.up()
  })
})
