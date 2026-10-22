import { expect, test } from '@playwright/test'

test.describe('v-show Shared Layout Animation', () => {
  test('shared layout animation works with v-show toggle', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout', { waitUntil: 'domcontentloaded' })

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

    // Verify large box settles at its own geometry on the left side
    await expect.poll(async () => (await largeBox.boundingBox())?.width, { timeout: 4000 }).toBe(200)
    const largeBoxBounds = await largeBox.boundingBox()
    expect(largeBoxBounds).not.toBeNull()
    expect(largeBoxBounds!.width).toBe(200)
    expect(largeBoxBounds!.height).toBe(200)
  })

  test('layout animation interpolates size during v-show transition', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout', { waitUntil: 'domcontentloaded' })

    const toggle = page.locator('#toggle')
    const largeBox = page.locator('#large-box')

    // Toggle to show large box
    await toggle.click()

    // During the shared layout animation a FLIP transform is applied
    await expect.poll(() => largeBox.evaluate(el => window.getComputedStyle(el).transform), { timeout: 4000 })
      .not.toBe('none')
  })

  test('nested shared layout works with v-show', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout', { waitUntil: 'domcontentloaded' })

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

    // Nested small should be visible again
    await expect(nestedSmall).toBeVisible()
    await expect(nestedLarge).toBeHidden()
  })

  test('rapid v-show toggles converge to the correct state', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout', { waitUntil: 'domcontentloaded' })

    const toggle = page.locator('#toggle')
    const largeBox = page.locator('#large-box')
    const smallBox = page.locator('#small-box')
    await expect(smallBox).toBeVisible()

    // Nine clicks with no wait: leaves and enters overlap continuously.
    for (let i = 0; i < 9; i++)
      await toggle.click({ delay: 0 })

    await expect(largeBox).toBeVisible({ timeout: 4000 })
    await expect(smallBox).toBeHidden({ timeout: 4000 })

    await toggle.click()
    await expect(smallBox).toBeVisible({ timeout: 4000 })
    await expect(largeBox).toBeHidden({ timeout: 4000 })
  })

  test('multiple v-show toggles work correctly', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout', { waitUntil: 'domcontentloaded' })

    const toggle = page.locator('#toggle')
    const largeBox = page.locator('#large-box')
    const smallBox = page.locator('#small-box')
    await expect(smallBox).toBeVisible()

    // Wait for each step to settle instead of sleeping a fixed interval.
    for (let i = 0; i < 3; i++) {
      await toggle.click()
      if (i % 2 === 0) {
        await expect(largeBox).toBeVisible()
        await expect(smallBox).toBeHidden()
      }
      else {
        await expect(smallBox).toBeVisible()
        await expect(largeBox).toBeHidden()
      }
    }

    // After 3 toggles (odd number), large box should be visible.
    await expect(largeBox).toBeVisible()
    await expect(smallBox).toBeHidden()

    await toggle.click()

    // Now small box should be visible
    await expect(smallBox).toBeVisible()
    await expect(largeBox).toBeHidden()
  })

  test('v-show elements remain in DOM', async ({ page }) => {
    await page.goto('/animate-presence/v-show-shared-layout', { waitUntil: 'domcontentloaded' })

    const toggle = page.locator('#toggle')
    const largeBox = page.locator('#large-box')
    const smallBox = page.locator('#small-box')

    // Both elements should exist in DOM
    await expect(page.locator('#toggle')).toBeVisible()
    const largeBoxExists = await largeBox.count()
    const smallBoxExists = await smallBox.count()
    expect(largeBoxExists).toBe(1)
    expect(smallBoxExists).toBe(1)

    // Toggle
    await toggle.click()
    await expect(largeBox).toBeVisible()

    // Both should still exist in DOM (v-show doesn't remove elements)
    const largeBoxExistsAfter = await largeBox.count()
    const smallBoxExistsAfter = await smallBox.count()
    expect(largeBoxExistsAfter).toBe(1)
    expect(smallBoxExistsAfter).toBe(1)
  })
})
