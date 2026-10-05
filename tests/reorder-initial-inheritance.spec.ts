import { expect, test } from '@playwright/test'

/**
 * Reproduction for issue #276:
 * Reorder.Group's withDefaults omits the Boolean-typed MotionProps defaults,
 * so Vue casts the absent ones to `false` and bindProps() spreads them onto
 * the inner Motion — most visibly `initial: false`, which makes Reorder.Items
 * with only `variants` render at `visible` and skip their initial animation
 * (framer-motion's Reorder.Group behaves as a plain motion.ul with
 * initial undefined, so items inherit the parent's initial variant).
 */
test.describe('Reorder.Group prop defaults (#276)', () => {
  test('Reorder.Items inherit initial variant and play initial animation', async ({ page }) => {
    await page.goto('/reorder-initial-inheritance')

    // Mid initial-animation (visible has duration 1s): the item must still be
    // animating in from hidden (opacity 0). With the bug it renders at
    // opacity 1 immediately, skipping the initial animation entirely.
    await page.waitForTimeout(200)
    const midOpacity = Number.parseFloat(
      await page.locator('[data-testid="reorder-item-1"]').evaluate(el => getComputedStyle(el).opacity),
    )
    expect(midOpacity).toBeLessThan(0.9)

    // Eventually the initial animation completes
    await expect(page.locator('[data-testid="reorder-item-1"]')).toHaveCSS('opacity', '1', { timeout: 3000 })
  })
})
