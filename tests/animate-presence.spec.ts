import { expect, test } from '@playwright/test'

test.describe('AnimatePresence', () => {
  test('AnimatePresence test', async ({ page }) => {
    await page.goto('/animate-presence', { waitUntil: 'domcontentloaded' })

    const toggle = page.locator('#toggle')
    const item = page.locator('#animate-presence-item')
    await expect(item).toBeVisible()

    // Hide: the item stays mounted while it exits.
    await toggle.click()
    await page.waitForTimeout(100)

    const opacity = await item.evaluate(el => window.getComputedStyle(el).opacity)
    expect(+opacity).toBeLessThan(1)
    expect(await item.isVisible()).toBe(true)

    await page.waitForTimeout(400)
    expect(await item.isVisible()).toBe(false)

    // Show: it enters with an animation again.
    await toggle.click()
    await expect(item).toBeVisible()
    await expect.poll(() => item.evaluate(el => Number.parseFloat(window.getComputedStyle(el).opacity)), { timeout: 1500 })
      .toBeLessThan(1)
    await expect.poll(() => item.evaluate(el => window.getComputedStyle(el).opacity), { timeout: 1500 })
      .toBe('1')
  })

  test('exit animations with multiple motion components', async ({ page }) => {
    await page.goto('/animate-presence/multi-motion', { waitUntil: 'domcontentloaded' })

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

    // All should be animating (still visible but with reduced opacity)
    await expect.poll(() => motion1.evaluate(el => Number.parseFloat(window.getComputedStyle(el).opacity)), { timeout: 1500 })
      .toBeLessThan(1)

    // All should be removed from DOM
    await expect(motion1).not.toBeVisible()
    await expect(motion2).not.toBeVisible()
    await expect(motion3).not.toBeVisible()
  })

  test('exit animations with nested motion components', async ({ page }) => {
    await page.goto('/animate-presence/nested-motion', { waitUntil: 'domcontentloaded' })

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

    // Parent should be animating exit
    await expect.poll(() => parent.evaluate(el => Number.parseFloat(window.getComputedStyle(el).opacity)), { timeout: 1500 })
      .toBeLessThan(1)

    // All should be removed
    await expect(parent).not.toBeVisible()
    await expect(child1).not.toBeVisible()
    await expect(child2).not.toBeVisible()
    await expect(grandchild).not.toBeVisible()
  })

  test('onExitComplete fires after all motion components exit', async ({ page }) => {
    await page.goto('/animate-presence/multi-motion', { waitUntil: 'domcontentloaded' })

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

  test('v-show keeps the element in flow until the exit animation completes', async ({ page }) => {
    await page.goto('/animate-presence/v-show', { waitUntil: 'domcontentloaded' })

    const item = page.locator('#v-show-item')
    await expect(item).toBeVisible()

    await page.locator('#toggle').click()
    await page.waitForTimeout(100)

    // Still in flow while the exit runs, and already fading.
    await expect(item).toHaveCSS('display', 'block')
    const opacity = await item.evaluate(el => window.getComputedStyle(el).opacity)
    expect(+opacity).toBeLessThan(1)

    await page.waitForTimeout(600)
    await expect(item).toHaveCSS('display', 'none')
    await expect(page.locator('#exit-count')).toHaveText('1')

    // Showing again restores the same element.
    await page.locator('#toggle').click()
    await page.waitForTimeout(500)
    await expect(item).toHaveCSS('display', 'block')
    await expect(item).toBeVisible()
  })

  test('sync mode removes one item without hiding siblings', async ({ page }) => {
    await page.goto('/pop-layout', { waitUntil: 'domcontentloaded' })

    const addButton = page.locator('button:has-text("Add item")')
    await addButton.click()
    await addButton.click()
    const items = page.locator('ul div')
    await expect(items).toHaveCount(3)
    // Let the enter animations settle before removing.
    await expect.poll(() => items.nth(2).locator('li').evaluate(el => getComputedStyle(el).opacity)).toBe('1')

    await items.first().click()
    // Sibling stays visible throughout the exit (wait mode would hide it).
    await page.waitForTimeout(150)
    await expect(items.nth(1)).toBeVisible()
    await expect(items.nth(2)).toBeVisible()

    await expect(items).toHaveCount(2, { timeout: 5000 })
  })

  test('popLayout animates siblings to their new positions', async ({ page }) => {
    await page.goto('/pop-layout', { waitUntil: 'domcontentloaded' })

    const addButton = page.locator('button:has-text("Add item")')
    await addButton.click()
    await addButton.click()
    const rows = page.locator('ul > div li')
    await expect(rows).toHaveCount(3)
    await expect.poll(() => rows.nth(2).evaluate(el => getComputedStyle(el).opacity)).toBe('1')

    await page.locator('input[type="checkbox"]').check()
    await page.waitForTimeout(150)

    // Measure from the stage, which does not reflow with the list.
    const siblingOffset = () => page.evaluate(() => {
      const stage = document.querySelector('ul')!.closest('.relative.overflow-hidden') as HTMLElement
      const li = document.querySelectorAll('ul > div li')[1] as HTMLElement
      return {
        top: Math.round(li.getBoundingClientRect().top - stage.getBoundingClientRect().top),
        transform: getComputedStyle(li).transform,
      }
    })
    const before = await siblingOffset()

    await page.locator('ul > div li').first().dispatchEvent('click')

    // The sibling must travel into place, not jump: a FLIP transform is
    // applied and the element is still short of its final position.
    const mid = await siblingOffset()
    expect(mid.transform).not.toBe('none')
    expect(mid.top).toBeGreaterThan(before.top - 92)

    await expect(rows).toHaveCount(2, { timeout: 4000 })
    await expect.poll(async () => (await siblingOffset()).transform, { timeout: 4000 }).toBe('none')
  })

  test('popLayout keeps siblings stable when a second item exits mid-flight', async ({ page }) => {
    await page.goto('/pop-layout', { waitUntil: 'domcontentloaded' })

    const addButton = page.locator('button:has-text("Add item")')
    await addButton.click()
    await addButton.click()
    await addButton.click()
    await expect(page.locator('ul > div')).toHaveCount(4)
    await expect.poll(() => page.locator('ul > div li').nth(3).evaluate(el => getComputedStyle(el).opacity)).toBe('1')

    await page.locator('input[type="checkbox"]').check()
    await page.waitForTimeout(150)

    const siblingTop = () => page.evaluate(() => {
      const stage = document.querySelector('ul')!.closest('.relative.overflow-hidden') as HTMLElement
      const li = [...document.querySelectorAll('ul > div li')]
        .find(el => el.textContent?.includes('Item 3')) as HTMLElement
      return Math.round(li.getBoundingClientRect().top - stage.getBoundingClientRect().top)
    })

    await page.locator('ul > div li', { hasText: 'Item 0' }).dispatchEvent('click')
    await page.waitForTimeout(120)
    await page.locator('ul > div li', { hasText: 'Item 1' }).dispatchEvent('click')

    // The surviving sibling must settle monotonically. A pop style dropped
    // when the first exit finished would put that element back in flow and
    // shove this one down again mid-flight.
    const samples: number[] = []
    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(30)
      const top = await siblingTop().catch(() => null)
      if (top !== null)
        samples.push(top)
    }
    const maxJumpBack = samples.reduce(
      (worst, top, i) => (i === 0 ? worst : Math.max(worst, top - samples[i - 1])),
      0,
    )
    expect(maxJumpBack).toBeLessThan(4)
    await expect(page.locator('ul > div')).toHaveCount(2, { timeout: 4000 })
  })

  test('popLayout applies styles to direct child (div) not motion element (li)', async ({ page }) => {
    await page.goto('/pop-layout', { waitUntil: 'domcontentloaded' })

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
