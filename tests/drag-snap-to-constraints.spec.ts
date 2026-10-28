import { expect, test } from '@playwright/test'

test.describe('dragSnapToConstraints', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drag/drag-snap-to-constraints', { waitUntil: 'domcontentloaded' })
  })

  test('snaps to the nearest constraint edge on release', async ({ page }) => {
    const box = page.locator('[data-testid="snap-to-constraints-box"]')
    const container = page.locator('[data-testid="snap-to-constraints-container"]')

    const before = await box.boundingBox()
    const bounds = await container.boundingBox()
    expect(before).not.toBeNull()
    expect(bounds).not.toBeNull()

    const startX = before!.x + before!.width / 2
    const startY = before!.y + before!.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 130, startY, { steps: 20 })
    await page.mouse.up()

    await expect.poll(async () => {
      const boxed = await box.boundingBox()
      return boxed ? Math.round(boxed.x + boxed.width - (bounds!.x + bounds!.width)) : null
    }, { timeout: 5000 }).toBe(0)
  })
})
