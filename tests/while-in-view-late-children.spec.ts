import { expect, test } from '@playwright/test'

/**
 * Regression test for https://github.com/motiondivision/motion-vue/issues/312
 *
 * A child with only `variants` that mounts after its parent's `whileInView`
 * has already activated must animate to the parent's active variant, the
 * same as a child present during the first activation.
 */
test.describe('whileInView late children', () => {
  test('late child inherits the active whileInView variant', async ({ page }) => {
    await page.goto('/while-in-view-late-children', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('[data-testid="item-1"]')).toHaveCSS('opacity', '1', { timeout: 3000 })

    await page.click('[data-testid="add-btn"]')

    const lateChild = page.locator('[data-testid="item-3"]')
    await lateChild.waitFor({ state: 'attached' })
    const opacityOnMount = Number.parseFloat(
      await lateChild.evaluate(el => getComputedStyle(el).opacity),
    )
    expect(opacityOnMount).toBeLessThan(1)

    await expect(lateChild).toHaveCSS('opacity', '1', { timeout: 3000 })
  })
})
