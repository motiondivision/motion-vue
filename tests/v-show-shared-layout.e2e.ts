import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('v-show Shared Layout Animation', () => {
  beforeEach(async ({ app }) => {
    await app.open('/animate-presence/v-show-shared-layout')
  })

  test('shared layout animation works with v-show toggle', { requires: ['browser'] }, async ({ browser }) => {
    const toggle = browser.locator('#toggle')
    const largeBox = browser.locator('#large-box')
    const smallBox = browser.locator('#small-box')

    await expect(smallBox).toBeVisible()
    await expect(largeBox).toBeHidden()

    const smallBoxInitialBounds = await smallBox.boundingBox()
    expect(smallBoxInitialBounds).not.toBeNull()

    await toggle.click()

    await expect(largeBox).toBeVisible()
    await expect(smallBox).toBeHidden()
    await expect.poll(async () => {
      const bounds = await largeBox.boundingBox()
      return bounds !== null && bounds.width === 200 && bounds.height === 200
    }).toBe(true)
  })

  test('layout animation interpolates size during v-show transition', { requires: ['browser'] }, async ({ browser }) => {
    const toggle = browser.locator('#toggle')
    const largeBox = browser.locator('#large-box')

    await toggle.click()

    await expect(largeBox).toBeVisible()
    await expect.poll(() => browser.evaluate(() => {
      const largeBoxElement = document.querySelector('#large-box')
      if (!largeBoxElement)
        return false

      const transform = window.getComputedStyle(largeBoxElement).transform
      return transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)'
    }), { interval: 16, timeout: 1000 }).toBe(true)
  })

  test('nested shared layout works with v-show', { requires: ['browser'] }, async ({ browser }) => {
    const toggle = browser.locator('#toggle')
    const nestedLarge = browser.locator('#nested-large')
    const nestedSmall = browser.locator('#nested-small')

    await expect(nestedSmall).toBeVisible()
    await expect(nestedLarge).toBeHidden()

    await toggle.click()

    await expect(nestedLarge).toBeVisible()
    await expect(nestedSmall).toBeHidden()

    await toggle.click()

    await expect(nestedSmall).toBeVisible()
    await expect(nestedLarge).toBeHidden()
  })

  test('multiple v-show toggles work correctly', { requires: ['browser'] }, async ({ browser }) => {
    const toggle = browser.locator('#toggle')
    const largeBox = browser.locator('#large-box')
    const smallBox = browser.locator('#small-box')

    for (let i = 0; i < 3; i++) {
      await toggle.click()
      if (i % 2 === 0)
        await expect(largeBox).toBeVisible()
      else
        await expect(smallBox).toBeVisible()
    }

    await expect(largeBox).toBeVisible()
    await expect(smallBox).toBeHidden()

    await toggle.click()

    await expect(smallBox).toBeVisible()
    await expect(largeBox).toBeHidden()
  })

  test('v-show elements remain in DOM', { requires: ['browser'] }, async ({ browser }) => {
    const toggle = browser.locator('#toggle')
    const largeBox = browser.locator('#large-box')
    const smallBox = browser.locator('#small-box')

    await expect(largeBox).toHaveCount(1)
    await expect(smallBox).toHaveCount(1)

    await toggle.click()

    await expect(largeBox).toBeVisible()
    await expect(smallBox).toBeHidden()
    await expect(largeBox).toHaveCount(1)
    await expect(smallBox).toHaveCount(1)
  })
})
