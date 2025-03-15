import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Wait for an animation to complete on an element
 */
export async function waitForAnimation(page: Page, selector: string) {
  await page.locator(selector).evaluate((el) => {
    return new Promise((resolve) => {
      el.addEventListener('motioncomplete', resolve, { once: true })
    })
  })
}

/**
 * Wait for all animations to complete on the page
 */
export async function waitForAllAnimations(page: Page) {
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.querySelectorAll('[data-motion]')).map(
        el =>
          new Promise((resolve) => {
            el.addEventListener('motioncomplete', resolve, { once: true })
          }),
      ),
    )
  })
}

/**
 * Check if element has expected transform
 */
export async function expectTransform(page: Page, selector: string, expected: string) {
  const transform = await page.locator(selector).evaluate((el) => {
    const style = window.getComputedStyle(el)
    return style.transform
  })
  expect(transform).toBe(expected)
}

/**
 * Check if element has expected opacity
 */
export async function expectOpacity(page: Page, selector: string, expected: string) {
  const opacity = await page.locator(selector).evaluate((el) => {
    const style = window.getComputedStyle(el)
    return style.opacity
  })
  expect(opacity).toBe(expected)
}

/**
 * Check if element has finished transitioning
 */
export async function expectTransitionEnd(page: Page, selector: string) {
  await page.locator(selector).evaluate((el) => {
    return new Promise((resolve) => {
      el.addEventListener('transitionend', resolve, { once: true })
    })
  })
}
