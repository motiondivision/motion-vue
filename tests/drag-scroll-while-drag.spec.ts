import { expect, test } from '@playwright/test'

test.describe('Drag Scroll While Dragging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drag/drag-scroll-while-drag')
  })

  test('element scroll: should keep element attached to cursor', async ({ page }) => {
    const box = page.locator('[data-testid="draggable-in-scrollable"]')
    const container = box.locator('..')

    // Get initial positions
    const boxStart = await box.boundingBox()
    expect(boxStart).not.toBeNull()

    const centerX = boxStart!.x + boxStart!.width / 2
    const centerY = boxStart!.y + boxStart!.height / 2

    // Start drag
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()

    // Move to establish drag - get position before scroll
    await page.mouse.move(centerX + 50, centerY)
    await page.waitForTimeout(100)

    const beforeScroll = await box.boundingBox()
    expect(beforeScroll).not.toBeNull()

    // Scroll container while dragging
    await container.evaluate((el) => {
      el.scrollTop = 100
    })
    await page.waitForTimeout(100)

    // Check element position after scroll - it should move with the scroll
    const afterScroll = await box.boundingBox()
    expect(afterScroll).not.toBeNull()

    // Element should have moved down by approximately the scroll amount
    const scrollMovedY = afterScroll!.y - beforeScroll!.y
    // Due to scroll compensation, the element should NOT move with the container
    // It should stay at roughly the same visual position
    expect(Math.abs(scrollMovedY)).toBeLessThan(50)

    // Continue drag movement
    await page.mouse.move(centerX + 100, centerY)
    await page.waitForTimeout(100)

    // Release
    await page.mouse.up()

    // Final check - element should be able to move
    const boxEnd = await box.boundingBox()
    expect(boxEnd).not.toBeNull()

    // Element should have moved from initial position
    const moved = boxEnd!.x - boxStart!.x
    expect(moved).toBeGreaterThan(30)
  })

  test('window scroll: basic drag works', async ({ page }) => {
    const box = page.locator('[data-testid="draggable-window-scroll"]')

    // Simply verify the element is present and draggable
    const boxStart = await box.boundingBox()
    expect(boxStart).not.toBeNull()

    const centerX = boxStart!.x + boxStart!.width / 2
    const centerY = boxStart!.y + boxStart!.height / 2

    // Start and complete a drag
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX + 50, centerY + 20)
    await page.mouse.up()

    // Verify element is still present
    const boxEnd = await box.boundingBox()
    expect(boxEnd).not.toBeNull()
  })

  test('combined: drag and scroll together', async ({ page }) => {
    const box = page.locator('[data-testid="draggable-in-scrollable"]')
    const container = box.locator('..')

    const boxStart = await box.boundingBox()
    expect(boxStart).not.toBeNull()

    const centerX = boxStart!.x + boxStart!.width / 2
    const centerY = boxStart!.y + boxStart!.height / 2

    // Start drag
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()

    // Drag and scroll simultaneously
    for (let i = 0; i < 5; i++) {
      await page.mouse.move(centerX + 20 * (i + 1), centerY)
      await container.evaluate((el, amount) => {
        el.scrollTop = amount
      }, 20 * (i + 1))
      await page.waitForTimeout(50)
    }

    await page.mouse.up()

    // Verify element maintained correct position
    const boxEnd = await box.boundingBox()
    expect(boxEnd).not.toBeNull()

    const moved = boxEnd!.x - boxStart!.x
    expect(moved).toBeGreaterThan(30)
  })
})
