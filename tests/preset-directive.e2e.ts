import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('Preset Directive', () => {
  beforeEach(async ({ app }) => {
    await app.open('/directive/preset')
  })

  async function getOpacity(browser: Parameters<Parameters<typeof test>[2]>[0]['browser'], testid: string) {
    return browser.evaluate((id: string) => {
      const el = document.querySelector(`[data-testid="${id}"]`)
      if (!el)
        return Number.NaN

      return Number.parseFloat(window.getComputedStyle(el).opacity)
    }, testid)
  }

  test('v-fade-in applies initial opacity 0 and animates to 1', { requires: ['browser'] }, async ({ browser }) => {
    const el = browser.locator('[data-testid="fade-in"]')
    await expect(el).toBeVisible()
    await expect.poll(() => getOpacity(browser, 'fade-in')).toBe(1)
  })

  test('v-slide-up applies initial translate and animates to 0', { requires: ['browser'] }, async ({ browser }) => {
    const el = browser.locator('[data-testid="slide-up"]')
    await expect(el).toBeVisible()
    await expect.poll(() => browser.evaluate(() => {
      const el = document.querySelector('[data-testid="slide-up"]')
      if (!el)
        return false

      const style = window.getComputedStyle(el)
      const transform = style.transform
      return (transform === 'none' || transform.endsWith(', 0)'))
        && Number.parseFloat(style.opacity) === 1
    })).toBe(true)
  })

  test('v-scale-in animates scale to 1', { requires: ['browser'] }, async ({ browser }) => {
    const el = browser.locator('[data-testid="scale-in"]')
    await expect(el).toBeVisible()
    await expect.poll(() => getOpacity(browser, 'scale-in')).toBe(1)
  })

  test('user binding overrides preset defaults', { requires: ['browser'] }, async ({ browser }) => {
    const el = browser.locator('[data-testid="override"]')
    await expect(el).toBeVisible()
    await expect.poll(() => getOpacity(browser, 'override')).toBe(1)
  })

  test('toggle mounts and unmounts preset element', { requires: ['browser'] }, async ({ browser }) => {
    const el = browser.locator('[data-testid="toggle-target"]')
    const toggleBtn = browser.locator('[data-testid="toggle-btn"]')
    await expect(el).toBeVisible()
    await expect.poll(() => getOpacity(browser, 'toggle-target')).toBe(1)

    await toggleBtn.click()
    await expect(el).not.toBeVisible()

    await toggleBtn.click()
    const elAgain = browser.locator('[data-testid="toggle-target"]')
    await expect(elAgain).toBeVisible()
  })
})
