import { expect, test } from '@playwright/test'

test.describe('AnimatePresence with LayoutGroup', () => {
  const url = '/animate-presence/group-animatepresence'

  test('container renders and toggle button works', async ({ page }) => {
    await page.goto(url)

    const container = page.locator('.container')
    const button = page.getByRole('button', { name: 'Toggle open' })

    await expect(container).toBeVisible()
    await expect(button).toBeVisible()
    // Initially closed
    await expect(container).toHaveAttribute('data-open', 'false')
  })

  test('container performs layout animation when children exit', async ({ page }) => {
    await page.goto(url)

    const button = page.getByRole('button', { name: 'Toggle open' })
    const container = page.locator('.container')

    // Open and wait for animations to fully settle
    await button.click()
    await page.waitForTimeout(800)

    // Record container height when open
    const openBounds = await container.boundingBox()
    expect(openBounds).not.toBeNull()

    // Close to trigger exit
    await button.click()

    // Wait for exit animation to complete and layout animation to start
    await page.waitForTimeout(500)

    // During the layout animation, the container should have a CSS transform applied
    // (FLIP technique: element jumps to final size, then reverse transform is animated)
    const hasMidTransform = await container.evaluate((el) => {
      const style = window.getComputedStyle(el)
      const transform = style.transform
      // During layout animation, transform should not be 'none' or identity
      return transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)'
    })

    // The container should have a transform during layout animation
    expect(hasMidTransform).toBe(true)
  })
})
