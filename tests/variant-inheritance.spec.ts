import { expect, test } from '@playwright/test'

/**
 * Variant inheritance: children with only `variants` (no own `animate` prop)
 * must register in the parent's variant tree so orchestration
 * (staggerChildren / delayChildren) and label changes propagate to them.
 *
 * Regression coverage for the v14 upgrade: Vue Boolean props default to
 * `false`, so every element got `inherit: false`, which v14 treats as
 * "cut the variant tree" — children never joined `variantChildren`.
 */
test.describe('Variant inheritance', () => {
  async function getOpacity(page: import('@playwright/test').Page, testid: string) {
    return Number.parseFloat(
      await page.locator(`[data-testid="${testid}"]`).evaluate(el => getComputedStyle(el).opacity),
    )
  }

  test('children inherit mount variant and animate with stagger order', async ({ page }) => {
    await page.goto('/variant-inheritance')

    // Mid-animation: item-1 (no delay) should be ahead of item-4 (0.6s delay)
    await page.waitForTimeout(200)
    const early1 = await getOpacity(page, 'item-1')
    const early4 = await getOpacity(page, 'item-4')
    expect(early1).toBeGreaterThan(early4)

    // Eventually all children reach the inherited "visible" target
    for (let i = 1; i <= 4; i++) {
      await expect(page.locator(`[data-testid="item-${i}"]`)).toHaveCSS('opacity', '1', { timeout: 3000 })
    }
  })

  test('children follow parent variant label changes', async ({ page }) => {
    await page.goto('/variant-inheritance')

    // Wait for mount animation to complete
    await expect(page.locator('[data-testid="item-1"]')).toHaveCSS('opacity', '1', { timeout: 3000 })

    // Switch parent to "hidden": children should animate back to opacity 0
    await page.click('[data-testid="toggle-btn"]')
    for (let i = 1; i <= 4; i++) {
      await expect(page.locator(`[data-testid="item-${i}"]`)).toHaveCSS('opacity', '0', { timeout: 3000 })
    }

    // Switch back to "visible": children should animate in again
    await page.click('[data-testid="toggle-btn"]')
    for (let i = 1; i <= 4; i++) {
      await expect(page.locator(`[data-testid="item-${i}"]`)).toHaveCSS('opacity', '1', { timeout: 3000 })
    }
  })
})
