import { expect, test } from '@playwright/test'

test.describe('v-show Shared Layout Animation', () => {
  test('shared layout animation works with v-show toggle', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout')

    const toggle = page.locator('#toggle')
    const largeBox = page.locator('#large-box')
    const smallBox = page.locator('#small-box')

    // Initially small box is visible (show = false)
    await expect(smallBox).toBeVisible()
    // Large box should be hidden via display:none but still in DOM
    await expect(largeBox).toBeHidden()

    // Get initial position of small box
    const smallBoxInitialBounds = await smallBox.boundingBox()
    expect(smallBoxInitialBounds).not.toBeNull()

    // Toggle to show large box
    await toggle.click()

    // Large box should now be visible
    await expect(largeBox).toBeVisible()
    // Small box should be hidden
    await expect(smallBox).toBeHidden()

    // Wait for animation to complete
    await page.waitForTimeout(400)

    // Verify large box is at expected position (left side)
    const largeBoxBounds = await largeBox.boundingBox()
    expect(largeBoxBounds).not.toBeNull()
    expect(largeBoxBounds!.width).toBe(200)
    expect(largeBoxBounds!.height).toBe(200)
  })

  test('layout animation interpolates size during v-show transition', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout')

    const toggle = page.locator('#toggle')
    const largeBox = page.locator('#large-box')

    // Toggle to show large box
    await toggle.click()

    // Wait a bit for animation to be in progress
    await page.waitForTimeout(100)

    // Get current transform during animation
    const transform = await largeBox.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })

    // During shared layout animation, transform should be applied
    // (either a scale or translate transform for FLIP animation)
    expect(transform).not.toBe('none')
  })

  test('nested shared layout works with v-show', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout')

    const toggle = page.locator('#toggle')
    const nestedLarge = page.locator('#nested-large')
    const nestedSmall = page.locator('#nested-small')

    // Initially nested small is visible
    await expect(nestedSmall).toBeVisible()
    await expect(nestedLarge).toBeHidden()

    // Toggle
    await toggle.click()

    // Nested large should be visible
    await expect(nestedLarge).toBeVisible()
    await expect(nestedSmall).toBeHidden()

    // Toggle back
    await toggle.click()
    await page.waitForTimeout(400)

    // Nested small should be visible again
    await expect(nestedSmall).toBeVisible()
    await expect(nestedLarge).toBeHidden()
  })

  test('multiple v-show toggles work correctly', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout')

    const toggle = page.locator('#toggle')
    const largeBox = page.locator('#large-box')
    const smallBox = page.locator('#small-box')

    // Perform multiple rapid toggles
    for (let i = 0; i < 3; i++) {
      await toggle.click()
      await page.waitForTimeout(400)
    }

    // After 3 toggles (odd number), large box should be visible
    await expect(largeBox).toBeVisible()
    await expect(smallBox).toBeHidden()

    // Toggle once more
    await toggle.click()
    await page.waitForTimeout(400)

    // Now small box should be visible
    await expect(smallBox).toBeVisible()
    await expect(largeBox).toBeHidden()
  })

  test('v-show elements remain in DOM', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout')

    const toggle = page.locator('#toggle')
    const largeBox = page.locator('#large-box')
    const smallBox = page.locator('#small-box')

    // Both elements should exist in DOM
    const largeBoxExists = await largeBox.count()
    const smallBoxExists = await smallBox.count()
    expect(largeBoxExists).toBe(1)
    expect(smallBoxExists).toBe(1)

    // Toggle
    await toggle.click()
    await page.waitForTimeout(400)

    // Both should still exist in DOM (v-show doesn't remove elements)
    const largeBoxExistsAfter = await largeBox.count()
    const smallBoxExistsAfter = await smallBox.count()
    expect(largeBoxExistsAfter).toBe(1)
    expect(smallBoxExistsAfter).toBe(1)
  })
})
