import { expect, test } from '@playwright/test'

test.describe('AnimatePresence', () => {
  test('AnimatePresence test', async ({ page }) => {
    await page.goto('/animate-presence')

    const toggle = await page.waitForSelector('#toggle')

    await toggle.click()

    const animatePresenceItem = await page.waitForSelector('#animate-presence-item')

    await expect(animatePresenceItem).toBeDefined()

    await toggle.click()
    await page.waitForTimeout(100)
    const opacity = await animatePresenceItem?.evaluate(el => window.getComputedStyle(el).opacity)
    expect(+opacity).toBeLessThan(1)
    expect(await animatePresenceItem.isVisible()).toBe(true)
    await page.waitForTimeout(400)
    expect(await animatePresenceItem.isVisible()).toBe(false)
  })

  test('popLayout applies styles to direct child (div) not motion element (li)', async ({ page }) => {
    await page.goto('/pop-layout')

    // Enable popLayout mode
    const checkbox = await page.locator('input[type="checkbox"]')
    await checkbox.check()
    await page.waitForTimeout(100)

    // Add an item to have multiple items
    const addButton = await page.locator('button:has-text("Add item")')
    await addButton.click()
    await page.waitForTimeout(100)

    // Get all items
    const items = await page.locator('ul div')
    const itemCount = await items.count()
    expect(itemCount).toBeGreaterThan(1)

    // Click last item to trigger exit
    const lastItem = items.last()
    await lastItem.click()

    // Wait for exit animation to start
    await page.waitForTimeout(50)

    // Verify the structure: AnimatePresence > div (direct child) > Motion (li)
    const structure = await lastItem.evaluate((divChild) => {
      const liElement = divChild?.querySelector('li') // Motion element inside div
      return {
        hasDivChild: !!divChild,
        hasLiInDiv: !!liElement,
        divHasMotionPopId: !!(divChild as HTMLElement)?.dataset?.motionPopId,
        liHasMotionPopId: !!(liElement as HTMLElement)?.dataset?.motionPopId,
        divMotionPopId: (divChild as HTMLElement)?.dataset?.motionPopId,
        liMotionPopId: (liElement as HTMLElement)?.dataset?.motionPopId,
      }
    })

    // CRITICAL: div (direct child) should have motionPopId, not li (motion element)
    expect(structure.divHasMotionPopId).toBe(true)
    expect(structure.liHasMotionPopId).toBe(false)

    // Verify presence- prefix
    expect(structure.divMotionPopId).toMatch(/^presence-motion-state-\d+$/)

    // Verify div has absolute positioning from injected styles
    const divPosition = await lastItem.evaluate((divChild) => {
      return divChild ? window.getComputedStyle(divChild).position : null
    })
    expect(divPosition).toBe('absolute')

    // Wait for animation to complete
    await page.waitForTimeout(1200)

    // Verify item was removed
    const finalItemCount = await page.locator('ul div').count()
    expect(finalItemCount).toBe(itemCount - 1)
  })
})
