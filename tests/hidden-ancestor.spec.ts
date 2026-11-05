import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Click `button`, then sample `target`'s computed opacity every frame for `ms`.
 */
function clickAndSample(page: Page, button: string, target: string, ms = 600) {
  return page.evaluate(({ button, target, ms }) => new Promise<number[]>((resolve) => {
    const samples: number[] = []
    document.querySelector<HTMLElement>(button)!.click()
    const start = performance.now()
    const tick = () => {
      const el = document.querySelector(target)
      samples.push(el ? Number(getComputedStyle(el).opacity) : Number.NaN)
      performance.now() - start < ms ? requestAnimationFrame(tick) : resolve(samples)
    }
    requestAnimationFrame(tick)
  }), { button, target, ms })
}

test.describe('motion elements mounted under a hidden ancestor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/animate-presence/hidden-ancestor', { waitUntil: 'networkidle' })
  })

  test('a presence child hidden by a v-show above AnimatePresence shows once revealed', async ({ page }) => {
    const samples = await clickAndSample(page, '#toggle-ancestor', '#ancestor-item-1')
    expect(samples.at(-1)).toBe(1)
  })

  test('a presence child added while the ancestor is hidden again shows once revealed', async ({ page }) => {
    await clickAndSample(page, '#toggle-ancestor', '#ancestor-item-1')
    await page.locator('#toggle-ancestor').click()
    await page.locator('#add-ancestor-item').click()
    const samples = await clickAndSample(page, '#toggle-ancestor', '#ancestor-item-2')
    expect(samples.at(-1)).toBe(1)
  })

  test('a motion element outside AnimatePresence hidden by an ancestor v-show shows once revealed', async ({ page }) => {
    const samples = await clickAndSample(page, '#toggle-bare', '#bare-item')
    expect(samples.at(-1)).toBe(1)
  })

  test('a v-show on the presence child wrapper still shows and plays its exit', async ({ page }) => {
    const enter = await clickAndSample(page, '#toggle-wrapper', '#wrapper-item')
    expect(enter.at(-1)).toBe(1)

    const exit = await clickAndSample(page, '#toggle-wrapper', '#wrapper-item', 150)
    expect(Math.min(...exit)).toBeLessThan(1)
    await expect(page.locator('#wrapper')).toBeVisible()
    await expect(page.locator('#wrapper')).toBeHidden()
  })

  test('a motion element added inside a hidden presence child animates in once revealed', async ({ page }) => {
    await clickAndSample(page, '#toggle-wrapper', '#wrapper-item')
    await page.locator('#toggle-wrapper').click()
    await expect(page.locator('#wrapper')).toBeHidden()
    await page.locator('#add-wrapper-item').click()
    // Longer than the fade, so an item that animated in while hidden would already be at 1.
    await page.waitForTimeout(600)
    const enter = await clickAndSample(page, '#toggle-wrapper', '#wrapper-added-1')
    expect(Math.min(...enter)).toBeLessThan(0.5)
    expect(enter.at(-1)).toBe(1)
  })

  test('a v-show on the motion element itself still plays enter and exit', async ({ page }) => {
    const enter = await clickAndSample(page, '#toggle-direct', '#direct-item')
    expect(Math.min(...enter)).toBeLessThan(0.5)
    expect(enter.at(-1)).toBe(1)

    const exit = await clickAndSample(page, '#toggle-direct', '#direct-item', 150)
    expect(Math.min(...exit)).toBeLessThan(1)
    await expect(page.locator('#direct-item')).toBeHidden()
  })
})
