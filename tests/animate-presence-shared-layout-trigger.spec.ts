import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

function sampleWidths(page: Page, selector: string) {
  return page.evaluate((selector) => {
    const widths: number[] = []
    const start = performance.now()
    ;(window as any).__widths = widths
    const tick = () => {
      const el = document.querySelector(selector)
      if (el)
        widths.push(Math.round(el.getBoundingClientRect().width))
      if (performance.now() - start < 1000)
        requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, selector)
}

test.describe('AnimatePresence shared layout from a persistent trigger', () => {
  test('the panel grows out of the trigger on open', async ({ page }) => {
    await page.goto('/animate-presence/shared-layout-trigger', { waitUntil: 'domcontentloaded' })
    const trigger = page.locator('#trigger')
    await expect(trigger).toBeVisible()
    const triggerWidth = Math.round((await trigger.boundingBox())!.width)

    await sampleWidths(page, '#panel')
    await trigger.click()
    await page.waitForTimeout(1100)
    const widths: number[] = await page.evaluate(() => (window as any).__widths)

    expect(widths.length, 'panel was sampled').toBeGreaterThan(0)
    expect(widths[0], 'first panel frame starts from the trigger').toBeLessThan(triggerWidth + 40)
    expect(widths.at(-1), 'panel settles at its own width').toBe(320)
  })

  test('the panel shrinks back into the trigger on close', async ({ page }) => {
    await page.goto('/animate-presence/shared-layout-trigger', { waitUntil: 'domcontentloaded' })
    await page.locator('#trigger').click()
    await expect.poll(async () => (await page.locator('#panel').boundingBox())?.width, { timeout: 3000 }).toBe(320)

    await sampleWidths(page, '#panel')
    await page.locator('#close').click()
    await page.waitForTimeout(1100)
    const widths: number[] = await page.evaluate(() => (window as any).__widths)

    expect(widths.some(width => width > 100 && width < 300), 'panel passes through intermediate widths').toBe(true)
    await expect(page.locator('#panel')).toHaveCount(0)
  })
})
