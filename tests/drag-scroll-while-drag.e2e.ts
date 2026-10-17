import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('Drag Scroll While Dragging', () => {
  beforeEach(async ({ app }) => {
    await app.open('/drag/drag-scroll-while-drag')
  })

  test('element scroll: should keep element attached to cursor', { requires: ['browser'] }, async ({ browser }) => {
    const box = browser.locator('[data-testid="draggable-in-scrollable"]')

    // Get initial positions
    const boxStart = await box.boundingBox()
    expect(boxStart).not.toBeNull()

    const centerX = boxStart!.x + boxStart!.width / 2
    const centerY = boxStart!.y + boxStart!.height / 2

    // Start drag
    await browser.mouse.move(centerX, centerY)
    await browser.mouse.down()

    // Move to establish drag - get position before scroll
    await browser.mouse.move(centerX + 50, centerY)
    await expect.poll(async () => (await box.boundingBox())?.x).toBeGreaterThan(boxStart!.x + 30)

    const beforeScroll = await box.boundingBox()
    expect(beforeScroll).not.toBeNull()

    // Scroll container while dragging
    await browser.evaluate(() => {
      const element = document.querySelector('[data-testid="draggable-in-scrollable"]')
      const container = element?.parentElement
      if (container)
        container.scrollTop = 100
    })
    await expect.poll(() => browser.evaluate(() => {
      return document.querySelector('[data-testid="draggable-in-scrollable"]')?.parentElement?.scrollTop
    })).toBe(100)

    // Due to scroll compensation, the element should stay at roughly the same visual position
    await expect.poll(async () => {
      const afterScroll = await box.boundingBox()
      return afterScroll ? Math.abs(afterScroll.y - beforeScroll!.y) : Number.POSITIVE_INFINITY
    }).toBeLessThan(50)

    // Continue drag movement
    await browser.mouse.move(centerX + 100, centerY)
    await expect.poll(async () => (await box.boundingBox())?.x).toBeGreaterThan(beforeScroll!.x + 30)

    // Release
    await browser.mouse.up()

    // Final check - element should be able to move
    const boxEnd = await box.boundingBox()
    expect(boxEnd).not.toBeNull()

    // Element should have moved from initial position
    const moved = boxEnd!.x - boxStart!.x
    expect(moved).toBeGreaterThan(30)
  })

  test('window scroll: basic drag works', { requires: ['browser'] }, async ({ browser }) => {
    const box = browser.locator('[data-testid="draggable-window-scroll"]')

    // Simply verify the element is present and draggable
    const boxStart = await box.boundingBox()
    expect(boxStart).not.toBeNull()

    const centerX = boxStart!.x + boxStart!.width / 2
    const centerY = boxStart!.y + boxStart!.height / 2

    // Start and complete a drag
    await browser.mouse.move(centerX, centerY)
    await browser.mouse.down()
    await browser.mouse.move(centerX + 50, centerY + 20)
    await browser.mouse.up()

    // Verify element is still present
    const boxEnd = await box.boundingBox()
    expect(boxEnd).not.toBeNull()
  })

  test('combined: drag and scroll together', { requires: ['browser'] }, async ({ browser }) => {
    const box = browser.locator('[data-testid="draggable-in-scrollable"]')

    const boxStart = await box.boundingBox()
    expect(boxStart).not.toBeNull()

    const centerX = boxStart!.x + boxStart!.width / 2
    const centerY = boxStart!.y + boxStart!.height / 2

    // Start drag
    await browser.mouse.move(centerX, centerY)
    await browser.mouse.down()

    // Drag and scroll simultaneously
    for (let i = 0; i < 5; i++) {
      const amount = 20 * (i + 1)
      await browser.mouse.move(centerX + amount, centerY)
      await browser.evaluate((scrollTop: number) => {
        const element = document.querySelector('[data-testid="draggable-in-scrollable"]')
        const container = element?.parentElement
        if (container)
          container.scrollTop = scrollTop
      }, amount)
      await expect.poll(() => browser.evaluate(() => {
        return document.querySelector('[data-testid="draggable-in-scrollable"]')?.parentElement?.scrollTop
      })).toBe(amount)
    }

    await browser.mouse.up()

    // Verify element maintained correct position
    await expect.poll(async () => {
      const boxEnd = await box.boundingBox()
      return boxEnd ? boxEnd.x - boxStart!.x : Number.NEGATIVE_INFINITY
    }).toBeGreaterThan(30)
  })
})
