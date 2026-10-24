import { describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

/**
 * Variant inheritance: children with only `variants` (no own `animate` prop)
 * must register in the parent's variant tree so orchestration
 * (staggerChildren / delayChildren) and label changes propagate to them.
 *
 * Regression coverage for the v14 upgrade: Vue Boolean props default to
 * `false`, so every element got `inherit: false`, which v14 treats as
 * "cut the variant tree" — children never joined `variantChildren`.
 */
describe('Variant inheritance', () => {
  async function getOpacity(browser: Parameters<Parameters<typeof test>[2]>[0]['browser'], testid: string) {
    return browser.evaluate((id: string) => {
      const el = document.querySelector(`[data-testid="${id}"]`)
      if (!el)
        return Number.NaN

      return Number.parseFloat(window.getComputedStyle(el).opacity)
    }, testid)
  }

  test('children inherit mount variant and animate with stagger order', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/variant-inheritance')

    // Mid-animation: item-1 (no delay) should be ahead of item-4 (0.6s delay)
    await expect.poll(async () => {
      const early1 = await getOpacity(browser, 'item-1')
      const early4 = await getOpacity(browser, 'item-4')
      return early1 > early4
    }, { interval: 50 }).toBe(true)

    // Eventually all children reach the inherited "visible" target
    for (let i = 1; i <= 4; i++) {
      await expect.poll(() => getOpacity(browser, `item-${i}`), { timeout: 3000 }).toBe(1)
    }
  })

  test('children follow parent variant label changes', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/variant-inheritance')

    // Wait for mount animation to complete
    await expect.poll(() => getOpacity(browser, 'item-1'), { timeout: 3000 }).toBe(1)

    // Switch parent to "hidden": children should animate back to opacity 0
    await browser.locator('[data-testid="toggle-btn"]').click()
    for (let i = 1; i <= 4; i++) {
      await expect.poll(() => getOpacity(browser, `item-${i}`), { timeout: 3000 }).toBe(0)
    }

    // Switch back to "visible": children should animate in again
    await browser.locator('[data-testid="toggle-btn"]').click()
    for (let i = 1; i <= 4; i++) {
      await expect.poll(() => getOpacity(browser, `item-${i}`), { timeout: 3000 }).toBe(1)
    }
  })
})
