import { expect, test } from '@playwright/test'

/**
 * These tests verify dragSnapToOrigin behavior:
 * 1. Element snaps back to origin when released
 * 2. Clicking during snap-back animation doesn't interrupt it
 *
 * Reference: React Framer Motion tests use pointer events with relative coordinates
 */
test.describe('dragSnapToOrigin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drag/drag-snap-to-origin')
  })

  test('should snap back to origin after drag', async ({ page }) => {
    const box = page.locator('[data-testid="snap-to-origin-box"]')

    // Get element position and center point
    const element = await box.boundingBox()
    expect(element).not.toBeNull()

    const centerX = element!.x + element!.width / 2
    const centerY = element!.y + element!.height / 2

    // Start dragging from element center
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()

    // Move mouse to drag element (200px to the right)
    await page.mouse.move(centerX + 200, centerY)

    // Release to start snap-back animation
    await page.mouse.up()

    // Wait for snap-back animation to complete
    await page.waitForTimeout(3000)

    // Check element returned to origin
    const afterDrag = await box.boundingBox()
    expect(afterDrag).not.toBeNull()

    const xDiff = Math.abs(afterDrag!.x - element!.x)
    const yDiff = Math.abs(afterDrag!.y - element!.y)

    expect(xDiff).toBeLessThan(20)
    expect(yDiff).toBeLessThan(20)
  })

  test('clicking during snap-back should not interrupt animation', async ({ page }) => {
    const box = page.locator('[data-testid="snap-to-origin-box"]')

    // Get element position and center point
    const element = await box.boundingBox()
    expect(element).not.toBeNull()

    const centerX = element!.x + element!.width / 2
    const centerY = element!.y + element!.height / 2

    // Start dragging from element center
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()

    // Move mouse to drag element (200px to the right)
    await page.mouse.move(centerX + 200, centerY)

    // Release to start snap-back animation
    await page.mouse.up()

    // Wait for snap-back animation to start
    await page.waitForTimeout(100)

    // Click on element during animation (at its new position, not origin)
    const currentPos = await box.boundingBox()
    expect(currentPos).not.toBeNull()
    const clickX = currentPos!.x + currentPos!.width / 2
    const clickY = currentPos!.y + currentPos!.height / 2

    await page.mouse.move(clickX, clickY)
    await page.mouse.down()
    await page.mouse.up()

    // Wait for animation to complete
    await page.waitForTimeout(2500)

    // Check element still reached origin despite click
    const finalBox = await box.boundingBox()
    expect(finalBox).not.toBeNull()

    const xDiff = Math.abs(finalBox!.x - element!.x)
    const yDiff = Math.abs(finalBox!.y - element!.y)

    expect(xDiff).toBeLessThan(20)
    expect(yDiff).toBeLessThan(20)
  })

  test('multiple clicks during snap-back should not interrupt animation', async ({ page }) => {
    const box = page.locator('[data-testid="snap-to-origin-box"]')

    // Get element position and center point
    const element = await box.boundingBox()
    expect(element).not.toBeNull()

    const centerX = element!.x + element!.width / 2
    const centerY = element!.y + element!.height / 2

    // Start dragging from element center
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()

    // Move mouse to drag element (200px to the right)
    await page.mouse.move(centerX + 200, centerY)

    // Release to start snap-back animation
    await page.mouse.up()

    // Wait for snap-back animation to start
    await page.waitForTimeout(100)

    // Click multiple times during animation
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(200)
      const currentPos = await box.boundingBox()
      expect(currentPos).not.toBeNull()
      const clickX = currentPos!.x + currentPos!.width / 2
      const clickY = currentPos!.y + currentPos!.height / 2

      await page.mouse.move(clickX, clickY)
      await page.mouse.down()
      await page.mouse.up()
    }

    // Wait for animation to complete
    await page.waitForTimeout(2000)

    // Check element still reached origin
    const finalBox = await box.boundingBox()
    expect(finalBox).not.toBeNull()

    const xDiff = Math.abs(finalBox!.x - element!.x)
    const yDiff = Math.abs(finalBox!.y - element!.y)

    expect(xDiff).toBeLessThan(20)
    expect(yDiff).toBeLessThan(20)
  })
})
