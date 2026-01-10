import { expect, test } from '@playwright/test'

/**
 * Tests for Reorder auto-scroll feature.
 * Verifies that when dragging a reorder item near the edge of a scrollable
 * container, the container automatically scrolls.
 */
test.describe('Reorder auto-scroll', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reorder/auto-scroll')
    await page.waitForTimeout(200)
  })

  test('Auto-scrolls down when dragging near bottom edge', async ({ page }) => {
    const container = page.locator('[data-testid="scroll-container"]')

    // Check initial scroll position
    const initialScroll = await container.evaluate(el => el.scrollTop)
    expect(initialScroll).toEqual(0)

    // Get the first item
    const item0 = page.locator('[data-testid="0"]')
    await item0.waitFor()

    // Get container dimensions
    const containerBox = await container.boundingBox()
    expect(containerBox).not.toBeNull()

    const nearBottom = containerBox!.y + containerBox!.height

    // Start dragging item 0
    await item0.hover()
    await page.mouse.down()
    await page.waitForTimeout(50)

    // Move slightly to initiate drag
    await page.mouse.move(50, 30)
    await page.waitForTimeout(50)

    // Move near bottom edge to trigger auto-scroll
    await page.mouse.move(50, nearBottom + 100)
    await page.waitForTimeout(300)

    // Check that container has scrolled down
    const afterScroll = await container.evaluate(el => el.scrollTop)
    expect(afterScroll).toBeGreaterThan(0)

    // Release mouse
    await page.mouse.up()
  })

  test('Auto-scrolls up when dragging near top edge', async ({ page }) => {
    const container = page.locator('[data-testid="scroll-container"]')

    // Scroll down first
    await container.evaluate((el) => {
      el.scrollTop = 200
    })
    await page.waitForTimeout(100)

    // Verify scroll position
    const scrollPosition = await container.evaluate(el => el.scrollTop)
    expect(scrollPosition).toEqual(200)

    // Get item 8 (further down the list)
    const item8 = page.locator('[data-testid="8"]')
    await item8.waitFor()

    // Start dragging
    await item8.hover()
    await page.mouse.down()
    await page.waitForTimeout(50)

    // Move slightly to initiate drag
    await page.mouse.move(50, 20)
    await page.waitForTimeout(50)

    // Move towards top edge (negative Y coordinate relative to viewport)
    // This should trigger upward auto-scroll
    await page.mouse.move(50, -100)
    await page.waitForTimeout(300)

    // Check that container has scrolled up
    const afterScroll = await container.evaluate(el => el.scrollTop)
    expect(afterScroll).toBeLessThan(200)

    // Release mouse
    await page.mouse.up()
  })

  test('Items remain draggable during and after auto-scroll', async ({ page }) => {
    const container = page.locator('[data-testid="scroll-container"]')
    const item0 = page.locator('[data-testid="0"]')

    await item0.waitFor()

    // Get initial position
    const initialBox = await item0.boundingBox()
    expect(initialBox).not.toBeNull()

    // Start dragging and trigger auto-scroll
    await item0.hover()
    await page.mouse.down()

    const containerBox = await container.boundingBox()
    expect(containerBox).not.toBeNull()

    // Move near bottom to scroll down
    await page.mouse.move(50, containerBox!.height - 30)
    await page.waitForTimeout(300)

    // Move near top to scroll up
    await page.mouse.move(50, 30)
    await page.waitForTimeout(300)

    // Release
    await page.mouse.up()
    await page.waitForTimeout(200)

    // Item should still be present and interactable
    const finalBox = await item0.boundingBox()
    expect(finalBox).not.toBeNull()
  })

  test('Horizontal auto-scroll works correctly', async ({ page }) => {
    const container = page.locator('[data-testid="horizontal-scroll-container"]')

    // Check initial scroll position
    const initialScroll = await container.evaluate(el => el.scrollLeft)
    expect(initialScroll).toEqual(0)

    // Get the first horizontal item
    const item1A = page.locator('[data-testid="h-1-A"]')
    await item1A.waitFor()

    // Get container dimensions
    const containerBox = await container.boundingBox()
    expect(containerBox).not.toBeNull()

    const nearRight = containerBox!.x + containerBox!.width + 100

    // Start dragging
    await item1A.hover()
    await page.mouse.down()
    await page.waitForTimeout(50)

    // Move near right edge to trigger auto-scroll
    await page.mouse.move(nearRight, 50)
    await page.waitForTimeout(300)

    // Check that container has scrolled right
    const afterScroll = await container.evaluate(el => el.scrollLeft)
    expect(afterScroll).toBeGreaterThan(0)

    // Release mouse
    await page.mouse.up()
  })
})

/**
 * Additional basic tests to ensure page loads correctly
 */
test.describe('Reorder auto-scroll - Basic', () => {
  test('page should load with reorder components', async ({ page }) => {
    await page.goto('/reorder/auto-scroll')

    // Check if any elements with the reorder styling are visible
    const items = page.locator('.bg-white').or(page.locator('[class*="cursor-grab"]'))

    // Wait a bit for the page to render
    await page.waitForTimeout(1000)

    const count = await items.count()

    // At minimum, we should see some elements if the page loaded
    expect(count).toBeGreaterThan(0)
  })
})
