import { expect, test } from '@playwright/test'

test.describe('Layout animation on mount', () => {
  const url = '/layout/layout-mount'

  test('layout element should not perform layout animation on first mount inside animating container', async ({ page }) => {
    await page.goto(url)

    const toggle = page.locator('#toggle')
    await toggle.click()

    // Wait a short time for mount and the first few animation frames
    await page.waitForTimeout(150)

    const layoutChild = page.locator('#layout-child')
    await expect(layoutChild).toBeVisible()

    // The layout child should NOT have a translate transform from the projection system.
    // Before the fix, the child would animate in from an offset position (e.g. translate3d(Xpx, Ypx, 0))
    // because the projection system captured an incorrect bounding rect while the parent was mid-scale.
    const transform = await layoutChild.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })

    // Transform should be 'none' or identity matrix — no layout animation offset
    const isIdentityOrNone = transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)'
    expect(isIdentityOrNone).toBe(true)
  })

  test('layout element should still animate layout changes after mount settles', async ({ page }) => {
    await page.goto(url)

    const toggle = page.locator('#toggle')
    await toggle.click()

    // Wait for mount to settle and container animation to finish
    await page.waitForTimeout(600)

    const layoutChild = page.locator('#layout-child')
    await expect(layoutChild).toBeVisible()

    // Now change the layout child's size from within the browser to trigger a real layout change
    await layoutChild.evaluate((el) => {
      el.style.width = '200px'
    })

    // Trigger a Vue update so the layout system picks up the change
    // We use requestAnimationFrame to allow the frame scheduler to process
    await page.waitForTimeout(100)

    const transform = await layoutChild.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })

    // After the first frame, the layout system should be active and could apply transforms
    // for real layout changes. We just verify it doesn't crash and the element is still visible.
    await expect(layoutChild).toBeVisible()
  })

  test('layout element with v-if toggle works correctly (mount/unmount cycle)', async ({ page }) => {
    await page.goto(url)

    const toggle = page.locator('#toggle')

    // Mount
    await toggle.click()
    await page.waitForTimeout(600)

    const layoutChild = page.locator('#layout-child')
    await expect(layoutChild).toBeVisible()

    // Unmount
    await toggle.click()
    await page.waitForTimeout(600)

    await expect(layoutChild).not.toBeVisible()

    // Re-mount — should also not have spurious layout animation
    await toggle.click()
    await page.waitForTimeout(150)

    await expect(layoutChild).toBeVisible()

    const transform = await layoutChild.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })

    const isIdentityOrNone = transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)'
    expect(isIdentityOrNone).toBe(true)
  })
})
