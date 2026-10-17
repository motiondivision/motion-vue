import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

/**
 * These tests verify that draggable elements with constraints properly
 * handle animation state when clicked during constraint return animations.
 */
describe('Drag Constraints Animation', () => {
  beforeEach(async ({ app }) => {
    await app.open('/drag/constraints-animation')
  })

  test('should not get stuck when clicked during constraint return', { requires: ['browser'] }, async ({ browser }) => {
    const dragBox = browser.locator('[data-testid="drag-box-1"]')

    // Get initial position
    const initialBox = await dragBox.boundingBox()
    expect(initialBox).not.toBeNull()

    // Drag element outside constraints
    const startX = initialBox!.x + initialBox!.width / 2
    const startY = initialBox!.y + initialBox!.height / 2
    await browser.mouse.move(startX, startY)
    await browser.mouse.down()
    await browser.mouse.move(startX + 30, startY)
    await browser.mouse.move(initialBox!.x - 200, initialBox!.y)
    await browser.mouse.up()

    // Click the element during return animation (this was the bug)
    await dragBox.click()

    // Element should have returned to constraints (not stuck outside)
    await expect.poll(async () => {
      const finalBox = await dragBox.boundingBox()
      return finalBox ? Math.abs(finalBox.x - initialBox!.x) : null
    }, { timeout: 5000 }).toBe(0)
  })
})
