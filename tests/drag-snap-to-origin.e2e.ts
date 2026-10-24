import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

/**
 * These tests verify dragSnapToOrigin behavior:
 * 1. Element snaps back to origin when released
 * 2. Clicking during snap-back animation doesn't interrupt it
 *
 * Reference: React Framer Motion tests use pointer events with relative coordinates
 */
describe('dragSnapToOrigin', () => {
  beforeEach(async ({ app }) => {
    await app.open('/drag/drag-snap-to-origin')
  })

  test('should snap back to origin after drag', { requires: ['browser'] }, async ({ browser }) => {
    const box = browser.locator('[data-testid="snap-to-origin-box"]')

    // Get element position and center point
    const element = await box.boundingBox()
    expect(element).not.toBeNull()

    const centerX = element!.x + element!.width / 2
    const centerY = element!.y + element!.height / 2

    // Start dragging from element center
    await browser.mouse.move(centerX, centerY)
    await browser.mouse.down()
    await browser.mouse.move(centerX + 20, centerY)

    // Move mouse to drag element (200px to the right)
    await browser.mouse.move(centerX + 200, centerY)

    // Release to start snap-back animation
    await browser.mouse.up()

    // Wait for snap-back animation to complete
    await expect.poll(async () => {
      const afterDrag = await box.boundingBox()
      return afterDrag
        ? Math.max(
          Math.abs(afterDrag.x - element!.x),
          Math.abs(afterDrag.y - element!.y),
        )
        : Number.POSITIVE_INFINITY
    }, { timeout: 8000 }).toBeLessThan(20)
  })

  test('clicking during snap-back should not interrupt animation', { requires: ['browser'] }, async ({ browser }) => {
    const box = browser.locator('[data-testid="snap-to-origin-box"]')

    // Get element position and center point
    const element = await box.boundingBox()
    expect(element).not.toBeNull()

    const centerX = element!.x + element!.width / 2
    const centerY = element!.y + element!.height / 2

    // Start dragging from element center
    await browser.mouse.move(centerX, centerY)
    await browser.mouse.down()
    await browser.mouse.move(centerX + 20, centerY)

    // Move mouse to drag element (200px to the right)
    await browser.mouse.move(centerX + 200, centerY)

    // Release to start snap-back animation
    await browser.mouse.up()

    // Wait until the element is away from origin before clicking during snap-back
    await expect.poll(async () => {
      const currentPos = await box.boundingBox()
      return currentPos ? Math.abs(currentPos.x - element!.x) : 0
    }, { timeout: 5000 }).toBeGreaterThan(50)

    // Click on element during animation (at its new position, not origin)
    const currentPos = await box.boundingBox()
    expect(currentPos).not.toBeNull()
    const clickX = currentPos!.x + currentPos!.width / 2
    const clickY = currentPos!.y + currentPos!.height / 2

    await browser.mouse.move(clickX, clickY)
    await browser.mouse.down()
    await browser.mouse.up()

    // Check element still reached origin despite click
    await expect.poll(async () => {
      const finalBox = await box.boundingBox()
      return finalBox
        ? Math.max(
          Math.abs(finalBox.x - element!.x),
          Math.abs(finalBox.y - element!.y),
        )
        : Number.POSITIVE_INFINITY
    }, { timeout: 8000 }).toBeLessThan(20)
  })

  test('multiple clicks during snap-back should not interrupt animation', { requires: ['browser'] }, async ({ browser }) => {
    const box = browser.locator('[data-testid="snap-to-origin-box"]')

    // Get element position and center point
    const element = await box.boundingBox()
    expect(element).not.toBeNull()

    const centerX = element!.x + element!.width / 2
    const centerY = element!.y + element!.height / 2

    // Start dragging from element center
    await browser.mouse.move(centerX, centerY)
    await browser.mouse.down()
    await browser.mouse.move(centerX + 20, centerY)

    // Move mouse to drag element (200px to the right)
    await browser.mouse.move(centerX + 200, centerY)

    // Release to start snap-back animation
    await browser.mouse.up()

    // Wait until the element is away from origin before clicking during snap-back
    await expect.poll(async () => {
      const currentPos = await box.boundingBox()
      return currentPos ? Math.abs(currentPos.x - element!.x) : 0
    }, { timeout: 5000 }).toBeGreaterThan(50)

    // Click multiple times during animation
    for (let i = 0; i < 3; i++) {
      const currentPos = await box.boundingBox()
      expect(currentPos).not.toBeNull()
      const clickX = currentPos!.x + currentPos!.width / 2
      const clickY = currentPos!.y + currentPos!.height / 2

      await browser.mouse.move(clickX, clickY)
      await browser.mouse.down()
      await browser.mouse.up()
    }

    // Check element still reached origin
    await expect.poll(async () => {
      const finalBox = await box.boundingBox()
      return finalBox
        ? Math.max(
          Math.abs(finalBox.x - element!.x),
          Math.abs(finalBox.y - element!.y),
        )
        : Number.POSITIVE_INFINITY
    }, { timeout: 8000 }).toBeLessThan(20)
  })
})
