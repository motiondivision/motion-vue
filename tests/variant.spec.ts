import { expect, test } from '@playwright/test'

// This test assumes the Vite dev server is running and the route is /dynamic-variant
const pointerOptions = {
  isPrimary: true,
  pointerId: 1,
}
test.describe('Variant', () => {
  test('should animate opacity when variant changes', async ({ page }) => {
    await page.goto('/dynamic-variant')
    const motionBtn = page.locator('[data-testid="motion-btn"]')
    // Initial: visible
    await expect(motionBtn).toHaveCSS('opacity', '1')
    // Click toggle
    await page.click('[data-testid="toggle-btn"]')
    // After: hidden
    await page.waitForTimeout(250)
    await expect(motionBtn).toHaveCSS('opacity', '0.25')
    // Click toggle again
    await page.click('[data-testid="toggle-btn"]')
    await page.waitForTimeout(250)
    await expect(motionBtn).toHaveCSS('opacity', '1')
  })

  test('should animate scale correctly on hover and press with variants', async ({ page }) => {
    await page.goto('/gestures/hover')

    // Wait for initial animation to complete
    await page.waitForTimeout(500)

    // Open the navigation menu first
    await page.click('.toggle-container')
    await page.waitForTimeout(300)

    // Get the first list item
    const firstItem = page.locator('.list-item').first()

    // Check initial scale (should be 1 or close to 1)
    const initialTransform = await firstItem.evaluate(el =>
      window.getComputedStyle(el).transform,
    )

    // Hover over the item - should scale to 1.1
    await firstItem.hover()
    await page.waitForTimeout(200)

    const hoverTransform = await firstItem.evaluate(el =>
      window.getComputedStyle(el).transform,
    )

    // Extract scale value from transform matrix
    const getScaleFromTransform = (transform: string) => {
      if (transform === 'none')
        return 1
      const matrix = transform.match(/matrix\(([^)]+)\)/)
      if (matrix) {
        const values = matrix[1].split(',').map(n => parseFloat(n.trim()))
        return Math.round(values[0] * 100) / 100 // scaleX value, rounded to 2 decimals
      }
      return 1
    }

    const initialScale = getScaleFromTransform(initialTransform)
    const hoverScale = getScaleFromTransform(hoverTransform)

    // Verify hover scale is approximately 1.1
    expect(hoverScale).toBeCloseTo(1.1, 1)
    expect(hoverScale).toBeGreaterThan(initialScale)

    // Press the item while hovering - should scale to 0.95
    // Start press
    await firstItem.dispatchEvent('pointerdown', pointerOptions)
    await page.waitForTimeout(300)

    const pressTransform = await firstItem.evaluate(el =>
      window.getComputedStyle(el).transform,
    )
    const pressScale = getScaleFromTransform(pressTransform)

    // Verify press scale is approximately 0.95
    expect(pressScale).toBeCloseTo(0.95, 1)
    expect(pressScale).toBeLessThan(initialScale)

    // // Release press - should return to hover scale
    await firstItem.dispatchEvent('pointerup', pointerOptions)
    await page.waitForTimeout(300)

    const afterPressTransform = await firstItem.evaluate(el =>
      window.getComputedStyle(el).transform,
    )
    const afterPressScale = getScaleFromTransform(afterPressTransform)

    // // Should return to hover scale (1.1)
    expect(afterPressScale).toBeCloseTo(1.1, 1)

    // // Move mouse away - should return to initial scale
    await page.mouse.move(0, 0)
    await page.waitForTimeout(300)

    const finalTransform = await firstItem.evaluate(el =>
      window.getComputedStyle(el).transform,
    )
    const finalScale = getScaleFromTransform(finalTransform)

    // // Should return to initial scale (1.0)
    expect(finalScale).toBeCloseTo(1.0, 1)
  })
})
