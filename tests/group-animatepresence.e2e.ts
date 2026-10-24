import { describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('AnimatePresence with LayoutGroup', () => {
  const url = '/animate-presence/group-animatepresence'

  test('container renders and toggle button works', { requires: ['browser'] }, async ({ app, browser, screen }) => {
    await app.open(url)

    const container = browser.locator('.container')
    const button = screen.getByRole('button', 'Toggle open')

    await expect(container).toBeVisible()
    await expect(button).toBeVisible()
    // Initially closed
    await expect(container).toHaveAttribute('data-open', 'false')
  })

  test('container performs layout animation when children exit', { requires: ['browser'] }, async ({ app, browser, screen }) => {
    await app.open(url)

    const button = screen.getByRole('button', 'Toggle open')
    const container = browser.locator('.container')

    // Open and wait for animations to fully settle
    await button.click()
    await expect(container).toHaveAttribute('data-open', 'true')
    await expect.poll(() => browser.evaluate(() => {
      const containerElement = document.querySelector('.container')
      const textElement = document.querySelector('.text')
      if (!containerElement || !textElement)
        return false

      const transform = window.getComputedStyle(containerElement).transform
      const transformSettled = transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)'
      return transformSettled && window.getComputedStyle(textElement).opacity === '1'
    })).toBe(true)

    // Record container height when open
    const openBounds = await container.boundingBox()
    expect(openBounds).not.toBeNull()

    // Close to trigger exit
    await button.click()
    await expect(container).toHaveAttribute('data-open', 'false')

    // During the layout animation, the container should have a CSS transform applied
    // (FLIP technique: element jumps to final size, then reverse transform is animated)
    await expect.poll(() => browser.evaluate(() => {
      const containerElement = document.querySelector('.container')
      if (!containerElement)
        return false

      const transform = window.getComputedStyle(containerElement).transform
      return transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)'
    }), { interval: 50 }).toBe(true)
  })
})
