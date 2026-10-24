import { describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('Variant', () => {
  async function getOpacity(browser: Parameters<Parameters<typeof test>[2]>[0]['browser'], selector: string) {
    return browser.evaluate((selector: string) => {
      const el = document.querySelector(selector)
      if (!el)
        return Number.NaN

      return Number.parseFloat(window.getComputedStyle(el).opacity)
    }, selector)
  }

  async function getScale(browser: Parameters<Parameters<typeof test>[2]>[0]['browser'], selector: string) {
    return browser.evaluate((selector: string) => {
      const el = document.querySelector(selector)
      if (!el)
        return Number.NaN

      const transform = window.getComputedStyle(el).transform
      if (transform === 'none')
        return 1

      const matrix = transform.match(/matrix\(([^)]+)\)/)
      if (matrix) {
        const values = matrix[1].split(',').map(n => Number.parseFloat(n.trim()))
        return Math.round(values[0] * 100) / 100
      }

      return 1
    }, selector)
  }

  test('should animate opacity when variant changes', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/dynamic-variant')

    const motionBtn = browser.locator('[data-testid="motion-btn"]')
    const toggleBtn = browser.locator('[data-testid="toggle-btn"]')
    await expect(motionBtn).toBeVisible()
    await expect.poll(() => getOpacity(browser, '[data-testid="motion-btn"]'), { timeout: 3000 }).toBe(1)

    await toggleBtn.click()
    await expect.poll(() => getOpacity(browser, '[data-testid="motion-btn"]'), { timeout: 3000 }).toBe(0.25)

    await toggleBtn.click()
    await expect.poll(() => getOpacity(browser, '[data-testid="motion-btn"]'), { timeout: 3000 }).toBe(1)
  })

  test('should animate scale correctly on hover and press with variants', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/gestures/hover')

    const list = browser.locator('.list')
    const toggle = browser.locator('.toggle-container')
    await expect(list).toBeVisible()
    await expect(toggle).toBeVisible()

    await toggle.click()
    const firstItem = browser.locator('.list-item').first()
    await expect(firstItem).toBeVisible()
    await expect.poll(() => getOpacity(browser, '.list-item'), { timeout: 3000 }).toBe(1)

    const selector = '.list-item'
    await expect.poll(() => getScale(browser, selector), { timeout: 3000 }).toBeCloseTo(1, 1)
    const initialScale = await getScale(browser, selector)

    await firstItem.hover()
    await expect.poll(() => getScale(browser, selector), { timeout: 3000 }).toBeCloseTo(1.1, 1)
    await expect.poll(async () => await getScale(browser, selector) > initialScale, { timeout: 3000 }).toBe(true)

    const box = await firstItem.boundingBox()
    expect(box).not.toBeNull()
    await browser.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await browser.mouse.down()
    await expect.poll(() => getScale(browser, selector), { timeout: 3000 }).toBeCloseTo(0.95, 1)

    await browser.mouse.up()
    await expect.poll(() => getScale(browser, selector), { timeout: 3000 }).toBeCloseTo(1.1, 1)

    await browser.mouse.move(0, 0)
    await expect.poll(() => getScale(browser, selector), { timeout: 3000 }).toBeCloseTo(1, 1)
  })
})
