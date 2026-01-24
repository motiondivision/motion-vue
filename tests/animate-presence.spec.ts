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

  test('exit animations with multiple motion components', async ({ page }) => {
    await page.goto('/animate-presence/multi-motion')

    const toggle = page.locator('#toggle')
    const motion1 = page.locator('#motion-1')
    const motion2 = page.locator('#motion-2')
    const motion3 = page.locator('#motion-3')

    // All 3 motion components should be visible
    await expect(motion1).toBeVisible()
    await expect(motion2).toBeVisible()
    await expect(motion3).toBeVisible()

    // Trigger exit
    await toggle.click()
    await page.waitForTimeout(100)

    // All should be animating (still visible but with reduced opacity)
    const opacity1 = await motion1.evaluate(el => window.getComputedStyle(el).opacity)
    expect(+opacity1).toBeLessThan(1)

    // Wait for all animations to complete
    await page.waitForTimeout(600)

    // All should be removed from DOM
    await expect(motion1).not.toBeVisible()
    await expect(motion2).not.toBeVisible()
    await expect(motion3).not.toBeVisible()
  })

  test('exit animations with nested motion components', async ({ page }) => {
    await page.goto('/animate-presence/nested-motion')

    const toggle = page.locator('#toggle')
    const parent = page.locator('#parent-motion')
    const child1 = page.locator('#child-motion-1')
    const child2 = page.locator('#child-motion-2')
    const grandchild = page.locator('#grandchild-motion')

    // All should be visible
    await expect(parent).toBeVisible()
    await expect(child1).toBeVisible()
    await expect(child2).toBeVisible()
    await expect(grandchild).toBeVisible()

    // Trigger exit
    await toggle.click()
    await page.waitForTimeout(100)

    // Parent should be animating exit
    const parentOpacity = await parent.evaluate(el => window.getComputedStyle(el).opacity)
    expect(+parentOpacity).toBeLessThan(1)

    // Wait for all animations to complete
    await page.waitForTimeout(500)

    // All should be removed
    await expect(parent).not.toBeVisible()
    await expect(child1).not.toBeVisible()
    await expect(child2).not.toBeVisible()
    await expect(grandchild).not.toBeVisible()
  })

  test('onExitComplete fires after all motion components exit', async ({ page }) => {
    await page.goto('/animate-presence/multi-motion')

    const toggle = page.locator('#toggle')
    const exitStatus = page.locator('#exit-status')

    // Initially present
    await expect(exitStatus).toHaveText('present')

    // Trigger exit
    await toggle.click()

    // Should still be present during animation
    await page.waitForTimeout(100)
    await expect(exitStatus).toHaveText('present')

    // After all animations complete, onExitComplete should fire
    await page.waitForTimeout(600)
    await expect(exitStatus).toHaveText('exited')
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
    expect(structure.divMotionPopId).toMatch(/^pop-\d+$/)

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
