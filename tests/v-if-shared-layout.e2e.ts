import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('v-if Shared Layout Animation with AnimatePresence', () => {
  beforeEach(async ({ app }) => {
    await app.open('/animate-presence/v-if-shared-layout')
  })

  test('shared layoutId handoff morphs and settles after v-if swap', { requires: ['browser'] }, async ({ browser }) => {
    const toggle = browser.locator('#toggle')
    const smallBox = browser.locator('#small-box')
    const largeBox = browser.locator('#large-box')

    await expect(smallBox).toBeVisible()
    await expect(largeBox).toHaveCount(0)

    const smallBounds = await smallBox.boundingBox()
    expect(smallBounds).not.toBeNull()

    await toggle.click()

    // During handoff the entering (or shared) element should carry a non-identity transform
    await expect.poll(() => browser.evaluate(() => {
      const large = document.querySelector('#large-box')
      const small = document.querySelector('#small-box')
      const el = large ?? small
      if (!el)
        return false
      const transform = window.getComputedStyle(el).transform
      return transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)'
    }), { interval: 16, timeout: 1500 }).toBe(true)

    await expect(largeBox).toBeVisible()
    await expect.poll(async () => {
      const bounds = await largeBox.boundingBox()
      return bounds !== null && Math.abs(bounds.width - 200) < 2 && Math.abs(bounds.height - 200) < 2
    }, { timeout: 3000 }).toBe(true)

    await expect.poll(() => browser.evaluate(() => {
      const large = document.querySelector('#large-box')
      if (!large)
        return false
      const transform = window.getComputedStyle(large).transform
      return transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)'
    }), { timeout: 3000 }).toBe(true)

    await expect(smallBox).toHaveCount(0)
  })

  test('toggling back restores small box geometry', { requires: ['browser'] }, async ({ browser }) => {
    const toggle = browser.locator('#toggle')
    const smallBox = browser.locator('#small-box')
    const largeBox = browser.locator('#large-box')

    await toggle.click()
    await expect(largeBox).toBeVisible()
    await expect.poll(async () => {
      const bounds = await largeBox.boundingBox()
      return bounds !== null && Math.abs(bounds.width - 200) < 2
    }, { timeout: 3000 }).toBe(true)

    await toggle.click()
    await expect(smallBox).toBeVisible()
    await expect.poll(async () => {
      const bounds = await smallBox.boundingBox()
      return bounds !== null && Math.abs(bounds.width - 100) < 2 && Math.abs(bounds.height - 100) < 2
    }, { timeout: 3000 }).toBe(true)
    await expect(largeBox).toHaveCount(0)
  })
})
