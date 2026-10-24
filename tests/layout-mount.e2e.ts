import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('Layout animation on mount', () => {
  beforeEach(async ({ app }) => {
    await app.open('/layout/layout-mount')
  })

  test('layout element should not perform layout animation on first mount inside animating container', { requires: ['browser'] }, async ({ browser }) => {
    const toggle = browser.locator('#toggle')
    const layoutChild = browser.locator('#layout-child')

    await toggle.click()

    // The child must stay at identity while its parent is still scaling.
    await expect.poll(() => browser.evaluate(() => {
      const container = document.querySelector('#container')
      const child = document.querySelector('#layout-child')
      if (!container || !child)
        return false

      const parentTransform = window.getComputedStyle(container).transform
      const childTransform = window.getComputedStyle(child).transform
      const parentIsAnimating = parentTransform !== 'none' && parentTransform !== 'matrix(1, 0, 0, 1, 0, 0)'
      const childIsIdentity = childTransform === 'none' || childTransform === 'matrix(1, 0, 0, 1, 0, 0)'
      return parentIsAnimating && childIsIdentity
    }), { interval: 16, timeout: 1000 }).toBe(true)

    await expect(layoutChild).toBeVisible()
  })

  test('layout element should still animate layout changes after mount settles', { requires: ['browser'] }, async ({ browser }) => {
    const toggle = browser.locator('#toggle')
    const layoutChild = browser.locator('#layout-child')

    await toggle.click()
    await expect(layoutChild).toBeVisible()
    await expect.poll(() => browser.evaluate(() => {
      const container = document.querySelector('#container')
      if (!container)
        return false

      const transform = window.getComputedStyle(container).transform
      return transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)'
    })).toBe(true)

    await browser.evaluate(() => {
      const child = document.querySelector('#layout-child') as HTMLElement | null
      if (!child)
        throw new Error('Layout child not found')

      child.style.width = '200px'
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
    })

    await expect(layoutChild).toBeVisible()
  })

  test('layout element with v-if toggle works correctly (mount/unmount cycle)', { requires: ['browser'] }, async ({ browser }) => {
    const toggle = browser.locator('#toggle')
    const layoutChild = browser.locator('#layout-child')

    await toggle.click()
    await expect(layoutChild).toBeVisible()
    await expect.poll(() => browser.evaluate(() => {
      const container = document.querySelector('#container')
      if (!container)
        return false

      const transform = window.getComputedStyle(container).transform
      return transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)'
    })).toBe(true)

    await toggle.click()
    await expect(layoutChild).not.toBeVisible()

    await toggle.click()
    await expect.poll(() => browser.evaluate(() => {
      const container = document.querySelector('#container')
      const child = document.querySelector('#layout-child')
      if (!container || !child)
        return false

      const parentTransform = window.getComputedStyle(container).transform
      const childTransform = window.getComputedStyle(child).transform
      const parentIsAnimating = parentTransform !== 'none' && parentTransform !== 'matrix(1, 0, 0, 1, 0, 0)'
      const childIsIdentity = childTransform === 'none' || childTransform === 'matrix(1, 0, 0, 1, 0, 0)'
      return parentIsAnimating && childIsIdentity
    }), { interval: 16, timeout: 1000 }).toBe(true)

    await expect(layoutChild).toBeVisible()
  })
})
