import { describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('AnimatePresence', () => {
  async function getOpacity(browser: Parameters<Parameters<typeof test>[2]>[0]['browser'], selector: string) {
    return browser.evaluate((cssSelector: string) => {
      const el = document.querySelector(cssSelector)
      if (!el)
        return Number.NaN

      return Number.parseFloat(window.getComputedStyle(el).opacity)
    }, selector)
  }

  test('AnimatePresence test', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/animate-presence')

    const toggle = browser.locator('#toggle')
    const animatePresenceItem = browser.locator('#animate-presence-item')

    await toggle.click()
    await expect(animatePresenceItem).toBeVisible()

    await toggle.click()
    await expect.poll(async () => {
      const opacity = await getOpacity(browser, '#animate-presence-item')
      return opacity < 1 && await animatePresenceItem.isVisible()
    }, { interval: 16, timeout: 1000 }).toBe(true)

    await expect(animatePresenceItem).not.toBeVisible()
  })

  test('exit animations with multiple motion components', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/animate-presence/multi-motion')

    const toggle = browser.locator('#toggle')
    const motion1 = browser.locator('#motion-1')
    const motion2 = browser.locator('#motion-2')
    const motion3 = browser.locator('#motion-3')

    await expect(motion1).toBeVisible()
    await expect(motion2).toBeVisible()
    await expect(motion3).toBeVisible()
    await expect.poll(() => getOpacity(browser, '#motion-1')).toBe(1)

    await toggle.click()
    await expect.poll(async () => {
      const opacity = await getOpacity(browser, '#motion-1')
      return opacity < 1 && await motion1.isVisible()
    }, { interval: 16, timeout: 1000 }).toBe(true)

    await expect(motion1).not.toBeVisible()
    await expect(motion2).not.toBeVisible()
    await expect(motion3).not.toBeVisible()
  })

  test('exit animations with nested motion components', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/animate-presence/nested-motion')

    const toggle = browser.locator('#toggle')
    const parent = browser.locator('#parent-motion')
    const child1 = browser.locator('#child-motion-1')
    const child2 = browser.locator('#child-motion-2')
    const grandchild = browser.locator('#grandchild-motion')

    await expect(parent).toBeVisible()
    await expect(child1).toBeVisible()
    await expect(child2).toBeVisible()
    await expect(grandchild).toBeVisible()
    await expect.poll(() => getOpacity(browser, '#parent-motion')).toBe(1)

    await toggle.click()
    await expect.poll(async () => {
      const opacity = await getOpacity(browser, '#parent-motion')
      return opacity < 1 && await parent.isVisible()
    }, { interval: 16, timeout: 1000 }).toBe(true)

    await expect(parent).not.toBeVisible()
    await expect(child1).not.toBeVisible()
    await expect(child2).not.toBeVisible()
    await expect(grandchild).not.toBeVisible()
  })

  test('onExitComplete fires after all motion components exit', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/animate-presence/multi-motion')

    const toggle = browser.locator('#toggle')
    const exitStatus = browser.locator('#exit-status')

    await expect(exitStatus).toHaveText('present')
    await expect.poll(() => getOpacity(browser, '#motion-1')).toBe(1)

    await toggle.click()
    await expect.poll(() => browser.evaluate(() => {
      const motion = document.querySelector('#motion-1')
      const status = document.querySelector('#exit-status')
      if (!motion || !status)
        return false

      const opacity = Number.parseFloat(window.getComputedStyle(motion).opacity)
      return opacity < 1 && status.textContent === 'present'
    }), { interval: 16, timeout: 1000 }).toBe(true)

    await expect(exitStatus).toHaveText('exited')
  })

  test('popLayout applies styles to direct child (div) not motion element (li)', { requires: ['browser'] }, async ({ app, browser, screen }) => {
    await app.open('/pop-layout')

    const checkbox = browser.locator('input[type="checkbox"]')
    await checkbox.check()
    await expect(checkbox).toBeChecked()

    await screen.getByRole('button', 'Add item').click()

    const items = browser.locator('ul div')
    await expect.poll(() => items.count()).toBeGreaterThan(1)
    const itemCount = await items.count()

    await items.last().click()

    await expect.poll(() => browser.evaluate(() => {
      const divChildren = document.querySelectorAll('ul div')
      const divChild = divChildren.item(divChildren.length - 1) as HTMLElement | null
      const liElement = divChild?.querySelector('li')

      return {
        divHasMotionPopId: Boolean(divChild?.dataset.motionPopId),
        liHasMotionPopId: Boolean(liElement?.dataset.motionPopId),
        divMotionPopId: divChild?.dataset.motionPopId ?? null,
        divPosition: divChild ? window.getComputedStyle(divChild).position : null,
      }
    }), { interval: 16, timeout: 1000 }).toMatchObject({
      divHasMotionPopId: true,
      liHasMotionPopId: false,
      divMotionPopId: expect.stringMatching(/^pop-\d+$/),
      divPosition: 'absolute',
    })

    await expect.poll(() => items.count()).toBe(itemCount - 1)
  })
})
