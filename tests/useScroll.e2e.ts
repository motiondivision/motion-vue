import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('useScroll with VueInstance', () => {
  beforeEach(async ({ app }) => {
    await app.open('/scroll-test')
  })

  test('should accept VueInstance as container', { requires: ['browser'] }, async ({ browser }) => {
    const container = browser.locator('.scroll-container')
    const scrollValue = browser.locator('.scroll-y-value')

    await expect(container).toBeVisible()

    await browser.evaluate(() => {
      const element = document.querySelector('.scroll-container')
      if (element)
        element.scrollTop = 100
    })

    await expect.poll(() => scrollValue.textContent()).toBe('100')

    const scrollTop = await browser.evaluate(() => document.querySelector('.scroll-container')?.scrollTop)
    expect(scrollTop).toBe(100)
  })

  test('should accept VueInstance as target', { requires: ['browser'] }, async ({ browser }) => {
    const target = browser.locator('.scroll-target')
    const scrollValue = browser.locator('.scroll-y-value')

    await expect(target).toBeVisible()

    await browser.evaluate(() => {
      const element = document.querySelector('.scroll-container')
      if (element)
        element.scrollTop = 50
    })

    await expect.poll(() => scrollValue.textContent()).toBe('50')
    await expect(target).toBeVisible()

    const boundingBox = await target.boundingBox()
    expect(boundingBox?.y).toBeDefined()
  })

  test('should work with both VueInstance container and target', { requires: ['browser'] }, async ({ browser }) => {
    const container = browser.locator('.scroll-container')
    const target = browser.locator('.scroll-target')
    const scrollValue = browser.locator('.scroll-y-value')
    const progressValue = browser.locator('.scroll-progress-value')

    await expect(container).toBeVisible()
    await expect(target).toBeVisible()

    const scrollPositions = [0, 50, 100]

    for (const position of scrollPositions) {
      await browser.evaluate((pos: number) => {
        const element = document.querySelector('.scroll-container')
        if (element)
          element.scrollTop = pos
      }, position)

      await expect.poll(() => scrollValue.textContent()).toBe(String(position))

      const scrollTop = await browser.evaluate(() => document.querySelector('.scroll-container')?.scrollTop)
      expect(scrollTop).toBe(position)

      const progress = await progressValue.textContent()
      expect(Number.parseFloat(progress || '0')).toBeGreaterThanOrEqual(0)
      expect(Number.parseFloat(progress || '0')).toBeLessThanOrEqual(1)
    }

    await expect(target).toBeVisible()
  })
})

describe('useScroll horizontal scroll (axis: x)', () => {
  beforeEach(async ({ app }) => {
    await app.open('/scroll-horizontal')
  })

  test('should track scrollX and scrollXProgress on horizontal scroll', { requires: ['browser'] }, async ({ browser }) => {
    const container = browser.locator('.scroll-container-h')
    const scrollXValue = browser.locator('.scroll-x-value')
    const progressValue = browser.locator('.scroll-x-progress-value')

    await expect(container).toBeVisible()

    const initialProgress = await progressValue.textContent()
    expect(Number.parseFloat(initialProgress || '1')).toBeCloseTo(0, 1)

    await browser.evaluate(() => {
      const element = document.querySelector('.scroll-container-h')
      if (element)
        element.scrollLeft = element.scrollWidth - element.clientWidth
    })

    await expect.poll(async () => Number.parseFloat(await scrollXValue.textContent() || '0')).toBeGreaterThan(0)
    await expect.poll(async () => Number.parseFloat(await progressValue.textContent() || '0')).toBeCloseTo(1, 1)
  })
})

describe('useScroll with ScrollOffset presets', () => {
  beforeEach(async ({ app }) => {
    await app.open('/scroll-presets')
  })

  test('scrollYProgress changes as target scrolls through container', { requires: ['browser'] }, async ({ browser }) => {
    const container = browser.locator('.scroll-container')
    const progressValue = browser.locator('.scroll-y-progress-value')

    await expect(container).toBeVisible()

    const initialProgress = await progressValue.textContent()
    expect(Number.parseFloat(initialProgress || '1')).toBeGreaterThanOrEqual(0)

    await browser.evaluate(() => {
      const element = document.querySelector('.scroll-container')
      if (element)
        element.scrollTop = element.scrollHeight / 2
    })

    await expect.poll(async () => Number.parseFloat(await progressValue.textContent() || '0'))
      .not.toBe(Number.parseFloat(initialProgress || '-1'))
  })

  test('ScrollOffset presets are exported from motion-v', { requires: ['browser'] }, async ({ browser }) => {
    const progressValue = browser.locator('.scroll-y-progress-value')

    await expect(progressValue).toBeVisible()

    const value = await progressValue.textContent()
    expect(value).toBeDefined()
  })
})

describe('useScroll reactive options', () => {
  beforeEach(async ({ app }) => {
    await app.open('/scroll-reactive')
  })

  test('reactive getter re-subscribes when axis changes', { requires: ['browser'] }, async ({ browser }) => {
    const container = browser.locator('.scroll-container')
    const scrollYValue = browser.locator('.scroll-y-value')
    const scrollXValue = browser.locator('.scroll-x-value')
    const currentAxis = browser.locator('.current-axis')

    await expect(container).toBeVisible()

    await browser.evaluate(() => {
      const element = document.querySelector('.scroll-container')
      if (element)
        element.scrollTop = 100
    })

    await expect.poll(async () => Number.parseFloat(await scrollYValue.textContent() || '0')).toBeGreaterThan(0)

    await browser.locator('.toggle-axis').click()

    await expect.poll(async () => (await currentAxis.textContent())?.trim()).toBe('x')

    await browser.evaluate(() => {
      const element = document.querySelector('.scroll-container')
      if (element)
        element.scrollLeft = 100
    })

    await expect.poll(async () => Number.parseFloat(await scrollXValue.textContent() || '0')).toBeGreaterThan(0)
  })
})
