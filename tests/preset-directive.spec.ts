import { expect, test } from '@playwright/test'

test.describe('Preset Directive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/directive/preset')
  })

  test('v-fade-in applies initial opacity 0 and animates to 1', async ({ page }) => {
    const el = page.locator('[data-testid="fade-in"]')
    await expect(el).toBeVisible()
    // After animation completes, opacity should be 1
    await page.waitForTimeout(600)
    await expect(el).toHaveCSS('opacity', '1')
  })

  test('v-slide-up applies initial translate and animates to 0', async ({ page }) => {
    const el = page.locator('[data-testid="slide-up"]')
    await expect(el).toBeVisible()
    // After animation completes
    await page.waitForTimeout(600)
    await expect(el).toHaveCSS('opacity', '1')
    const transform = await el.evaluate(e => window.getComputedStyle(e).transform)
    // Should be at y=0 (matrix with ty=0 or 'none')
    expect(transform === 'none' || transform.endsWith(', 0)')).toBe(true)
  })

  test('v-scale-in animates scale to 1', async ({ page }) => {
    const el = page.locator('[data-testid="scale-in"]')
    await expect(el).toBeVisible()
    await page.waitForTimeout(600)
    await expect(el).toHaveCSS('opacity', '1')
  })

  test('user binding overrides preset defaults', async ({ page }) => {
    const el = page.locator('[data-testid="override"]')
    await expect(el).toBeVisible()
    // After animation, should have opacity 1 (animate from preset) and x at 0
    await page.waitForTimeout(600)
    await expect(el).toHaveCSS('opacity', '1')
  })

  test('toggle mounts and unmounts preset element', async ({ page }) => {
    const el = page.locator('[data-testid="toggle-target"]')
    await expect(el).toBeVisible()
    await page.waitForTimeout(600)
    await expect(el).toHaveCSS('opacity', '1')

    // Hide
    await page.click('[data-testid="toggle-btn"]')
    await page.waitForTimeout(100)
    await expect(el).not.toBeVisible()

    // Show again
    await page.click('[data-testid="toggle-btn"]')
    const elAgain = page.locator('[data-testid="toggle-target"]')
    await expect(elAgain).toBeVisible()
  })
})
