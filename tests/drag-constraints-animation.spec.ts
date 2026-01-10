import { expect, test } from '@playwright/test'

/**
 * These tests verify that draggable elements with constraints properly
 * handle animation state when clicked during constraint return animations.
 */
test.describe('Drag Constraints Animation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drag/constraints-animation')
  })

  test('should not get stuck when clicked during constraint return', async ({ page }) => {
    const dragBox = page.locator('[data-testid="drag-box-1"]')

    // Get initial position
    const initialBox = await dragBox.boundingBox()
    expect(initialBox).not.toBeNull()

    // Drag element outside constraints
    await dragBox.hover()
    await page.mouse.down()
    await page.mouse.move(
      initialBox!.x - 200,
      initialBox!.y,
      { steps: 10 },
    )
    await page.mouse.up()

    // Wait a bit for return animation to start
    await page.waitForTimeout(100)

    // Click the element during return animation (this was the bug)
    await dragBox.click()

    // Wait for animation to potentially complete
    await page.waitForTimeout(300)

    // Element should have returned to constraints (not stuck outside)
    const finalBox = await dragBox.boundingBox()
    expect(finalBox).not.toBeNull()

    // The element should be roughly back to its initial position
    // (within constraints, allowing some tolerance for animation)
    const xDiff = Math.abs(finalBox!.x - initialBox!.x)
    expect(xDiff).toBe(0) // Should be close to original position
  })
})
