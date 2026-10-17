import { describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

/**
 * Reproduction for issue #276:
 * Reorder.Group's withDefaults omits the Boolean-typed MotionProps defaults,
 * so Vue casts the absent ones to `false` and bindProps() spreads them onto
 * the inner Motion — most visibly `initial: false`, which makes Reorder.Items
 * with only `variants` render at `visible` and skip their initial animation
 * (framer-motion's Reorder.Group behaves as a plain motion.ul with
 * initial undefined, so items inherit the parent's initial variant).
 */
describe('Reorder.Group prop defaults (#276)', () => {
  test('Reorder.Items inherit initial variant and play initial animation', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/reorder-initial-inheritance')

    // Mid initial-animation (visible has duration 1s): the item must still be
    // animating in from hidden (opacity 0). With the bug it renders at
    // opacity 1 immediately, skipping the initial animation entirely.
    await expect.poll(() => browser.evaluate(() => {
      const el = document.querySelector('[data-testid="reorder-item-1"]')
      if (!el)
        return false

      const opacity = Number.parseFloat(window.getComputedStyle(el).opacity)
      return opacity > 0 && opacity < 0.9
    }), { interval: 50 }).toBe(true)

    // Eventually the initial animation completes
    await expect.poll(() => browser.evaluate(() => {
      const el = document.querySelector('[data-testid="reorder-item-1"]')
      if (!el)
        return false

      return Number.parseFloat(window.getComputedStyle(el).opacity) === 1
    }), { timeout: 3000 }).toBe(true)
  })
})
