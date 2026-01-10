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

  test('dragSnapToOrigin should work with clicks during animation', async ({ page, browserName }) => {
    const dragBox = page.locator('[data-testid="drag-box-2"]')

    // Get initial box position BEFORE any dragging (this is the "origin")
    const initialBox = await dragBox.boundingBox()
    expect(initialBox).not.toBeNull()

    // Drag element away from origin (only on X axis to avoid overflow: hidden issues)
    await dragBox.hover()
    await page.mouse.down()
    await page.mouse.move(
      initialBox!.x + 150,
      initialBox!.y, // Keep Y the same
      { steps: 10 },
    )
    await page.mouse.up()

    // Wait for dragSnapToOrigin animation to complete
    await page.waitForTimeout(3000)

    const afterDragBox = await dragBox.boundingBox()
    expect(afterDragBox).not.toBeNull()

    // dragSnapToOrigin should return element to its original position
    const xDiffAfterDrag = Math.abs(afterDragBox!.x - initialBox!.x)
    const yDiffAfterDrag = Math.abs(afterDragBox!.y - initialBox!.y)

    // Element should snap back to its original position
    // Allow more tolerance for WebKit due to rendering inconsistencies
    const tolerance = browserName === 'webkit' ? 100 : 20
    expect(xDiffAfterDrag).toBeLessThan(tolerance)
    expect(yDiffAfterDrag).toBeLessThan(tolerance)

    // Now test that clicking during animation doesn't interrupt it
    // Drag again (only on X axis)
    await dragBox.hover()
    await page.mouse.down()
    await page.mouse.move(
      initialBox!.x + 150,
      initialBox!.y, // Keep Y the same
      { steps: 10 },
    )
    await page.mouse.up()

    // Wait for snap-back animation to start
    await page.waitForTimeout(50)

    // Click during animation (this should NOT interrupt snap-back)
    await dragBox.click()

    // Wait for animation to complete
    await page.waitForTimeout(1000)

    // Verify element still snapped to its original position despite click
    const finalBox = await dragBox.boundingBox()
    expect(finalBox).not.toBeNull()

    const xDiff = Math.abs(finalBox!.x - initialBox!.x)
    const yDiff = Math.abs(finalBox!.y - initialBox!.y)

    // Element should be back at its original position
    // Allow more tolerance for WebKit due to rendering inconsistencies
    expect(xDiff).toBeLessThan(tolerance)
    expect(yDiff).toBeLessThan(tolerance)
  })
})
