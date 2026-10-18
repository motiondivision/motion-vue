import { describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('AnimatePresence mode=wait and self-managed removal', () => {
  async function getOpacity(browser: Parameters<Parameters<typeof test>[2]>[0]['browser'], selector: string) {
    return browser.evaluate((cssSelector: string) => {
      const el = document.querySelector(cssSelector)
      if (!el)
        return null
      return Number.parseFloat(window.getComputedStyle(el).opacity)
    }, selector)
  }

  test('mode=wait keeps enter deferred until exit finishes', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/animate-presence/mode-wait')

    const switchPage = browser.locator('#switch-page')
    const panelA = browser.locator('#panel-a')
    const panelB = browser.locator('#panel-b')

    await expect(panelA).toBeVisible()
    await expect(panelB).toHaveCount(0)
    await expect.poll(() => getOpacity(browser, '#panel-a')).toBe(1)

    await switchPage.click()

    // While A exits, B must not be mounted yet (wait mode holds incoming children)
    await expect.poll(async () => {
      const aVisible = await panelA.isVisible().catch(() => false)
      const bCount = await panelB.count()
      const aOpacity = await getOpacity(browser, '#panel-a')
      return aVisible && bCount === 0 && aOpacity !== null && aOpacity < 1
    }, { interval: 16, timeout: 1500 }).toBe(true)

    await expect(panelB).toBeVisible({ timeout: 3000 })
    await expect.poll(() => getOpacity(browser, '#panel-b')).toBe(1)
    await expect(panelA).toHaveCount(0)
  })

  test('re-enter mid-exit keeps child mounted until exit settles then present', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/animate-presence/mode-wait')

    const toggle = browser.locator('#toggle-show')
    const item = browser.locator('#interrupt-item')

    await expect(item).toBeVisible()
    await expect.poll(() => getOpacity(browser, '#interrupt-item')).toBe(1)

    await toggle.click()

    // Exit started — still in DOM while opacity drops (self-managed removal)
    await expect.poll(async () => {
      const visible = await item.isVisible()
      const opacity = await getOpacity(browser, '#interrupt-item')
      return visible && opacity !== null && opacity < 1
    }, { interval: 16, timeout: 1000 }).toBe(true)

    // Interrupt: show again before exit completes
    await toggle.click()

    await expect(item).toBeVisible()
    await expect.poll(() => getOpacity(browser, '#interrupt-item'), { timeout: 3000 }).toBe(1)
  })

  test('list remove keeps exiting item mounted then siblings remain after commit', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/animate-presence/mode-wait')

    const removeFirst = browser.locator('#remove-first')
    const item1 = browser.locator('#list-item-1')
    const item2 = browser.locator('#list-item-2')
    const item3 = browser.locator('#list-item-3')

    await expect(item1).toBeVisible()
    await expect(item2).toBeVisible()
    await expect(item3).toBeVisible()

    const beforeOffsets = await browser.evaluate(() => {
      const list = document.querySelector('#layout-list') as HTMLElement | null
      const i2 = document.querySelector('#list-item-2') as HTMLElement | null
      const i3 = document.querySelector('#list-item-3') as HTMLElement | null
      if (!list || !i2 || !i3)
        return null
      return {
        item2: i2.offsetTop,
        item3: i3.offsetTop,
        count: list.querySelectorAll('li').length,
      }
    })
    expect(beforeOffsets).not.toBeNull()
    expect(beforeOffsets!.count).toBe(3)

    await removeFirst.click()

    // Self-managed removal: vanishing child stays mounted while exit plays
    await expect.poll(() => browser.evaluate(() => {
      const exiting = document.querySelector('#list-item-1')
      if (!exiting)
        return false
      const opacity = Number.parseFloat(window.getComputedStyle(exiting).opacity)
      return Number.isFinite(opacity) && opacity < 1
    }), { interval: 16, timeout: 1500 }).toBe(true)

    // Still three list children in the DOM during exit (exiting + two present)
    await expect.poll(() => browser.evaluate(() => {
      return document.querySelectorAll('#layout-list li').length
    }), { timeout: 500 }).toBe(3)

    // After exit commits, item1 is gone; remaining items still present and shifted up in the list
    await expect(item1).toHaveCount(0, { timeout: 3000 })
    await expect(item2).toBeVisible()
    await expect(item3).toBeVisible()

    await expect.poll(() => browser.evaluate(() => {
      const list = document.querySelector('#layout-list') as HTMLElement | null
      const i2 = document.querySelector('#list-item-2') as HTMLElement | null
      if (!list || !i2)
        return null
      return {
        count: list.querySelectorAll('li').length,
        item2: i2.offsetTop,
      }
    }), { timeout: 3000 }).toMatchObject({
      count: 2,
      item2: expect.any(Number),
    })

    const after = await browser.evaluate(() => {
      const i2 = document.querySelector('#list-item-2') as HTMLElement | null
      return i2?.offsetTop ?? null
    })
    expect(after).not.toBeNull()
    expect(after!).toBeLessThan(beforeOffsets!.item2)
  })
})
