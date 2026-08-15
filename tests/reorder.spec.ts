import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Tests for Reorder axis auto-detection, grid ("xy") reordering and RTL.
 */

async function getOrder(page: Page): Promise<string> {
  return (await page.locator('[data-testid="order"]').textContent())!.trim()
}

async function dragItemTo(page: Page, testId: string, targetX: number, targetY: number) {
  const item = page.locator(`[data-testid="${testId}"]`)
  const box = await item.boundingBox()
  expect(box).not.toBeNull()
  const startX = box!.x + box!.width / 2
  const startY = box!.y + box!.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.waitForTimeout(50)
  await page.mouse.move(targetX, targetY, { steps: 12 })
  await page.waitForTimeout(200)
}

test.describe('Reorder basic (axis auto-detected)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reorder')
    await page.waitForTimeout(200)
  })

  test('reorders a vertical list without an explicit axis', async ({ page }) => {
    expect(await getOrder(page)).toBe('0,1,2,3,4,5')

    // Drag item 0 onto item 1's position
    const item1Box = await page.locator('[data-testid="item-1"]').boundingBox()
    expect(item1Box).not.toBeNull()
    await dragItemTo(page, 'item-0', item1Box!.x + item1Box!.width / 2, item1Box!.y + item1Box!.height / 2 + 4)

    expect(await getOrder(page)).toBe('1,0,2,3,4,5')
    await page.mouse.up()

    // Order persists after release
    await page.waitForTimeout(300)
    expect(await getOrder(page)).toBe('1,0,2,3,4,5')
  })
})

test.describe('Reorder axis auto-detection', () => {
  test('detects horizontal axis for a horizontal list', async ({ page }) => {
    await page.goto('/reorder/auto-detect')
    await page.waitForTimeout(200)

    expect(await getOrder(page)).toBe('0,1,2,3,4,5')

    // Drag item 0 onto item 1's position — only possible if the detected
    // axis is "x"
    const item1Box = await page.locator('[data-testid="h-1"]').boundingBox()
    expect(item1Box).not.toBeNull()
    await dragItemTo(page, 'h-0', item1Box!.x + item1Box!.width / 2 + 4, item1Box!.y + item1Box!.height / 2)

    expect(await getOrder(page)).toBe('1,0,2,3,4,5')
    await page.mouse.up()
  })
})

test.describe('Reorder grid (axis="xy")', () => {
  test('reorders across lines in a wrapped grid', async ({ page }) => {
    await page.goto('/reorder/grid')
    await page.waitForTimeout(200)

    expect(await getOrder(page)).toBe('0,1,2,3,4,5')

    // Drag item 0 straight down into the second row (same column)
    const item0Box = await page.locator('[data-testid="g-0"]').boundingBox()
    const item3Box = await page.locator('[data-testid="g-3"]').boundingBox()
    expect(item0Box).not.toBeNull()
    expect(item3Box).not.toBeNull()
    await dragItemTo(
      page,
      'g-0',
      item0Box!.x + item0Box!.width / 2,
      item3Box!.y + item3Box!.height / 2,
    )

    // LTR: item 0 is inserted before the item to its right on the new line
    expect(await getOrder(page)).toBe('1,2,3,0,4,5')
    await page.mouse.up()
  })

  test('reorders within the same line', async ({ page }) => {
    await page.goto('/reorder/grid')
    await page.waitForTimeout(200)

    // Drag item 0 onto item 1's position (same row)
    const item1Box = await page.locator('[data-testid="g-1"]').boundingBox()
    expect(item1Box).not.toBeNull()
    await dragItemTo(page, 'g-0', item1Box!.x + item1Box!.width / 2, item1Box!.y + item1Box!.height / 2)

    expect(await getOrder(page)).toBe('1,0,2,3,4,5')
    await page.mouse.up()
  })
})

test.describe('Reorder RTL', () => {
  test('uses computed direction when inserting into another line', async ({ page }) => {
    await page.goto('/reorder/rtl')
    await page.waitForTimeout(200)

    expect(await getOrder(page)).toBe('0,1,2,3,4,5')

    // In RTL the first item is rightmost. Drag it straight down into the
    // second row without crossing any other item.
    const item0Box = await page.locator('[data-testid="r-0"]').boundingBox()
    const item3Box = await page.locator('[data-testid="r-3"]').boundingBox()
    expect(item0Box).not.toBeNull()
    expect(item3Box).not.toBeNull()
    await dragItemTo(
      page,
      'r-0',
      item0Box!.x + item0Box!.width / 2,
      item3Box!.y + item3Box!.height / 2,
    )

    // With direction detection working, item 0 is inserted before the
    // visually-next item ("1,2,3,0,4,5"). If RTL detection were broken
    // (always "ltr"), the same gesture would append it to the end of the
    // line instead ("1,2,3,4,5,0").
    expect(await getOrder(page)).toBe('1,2,3,0,4,5')
    await page.mouse.up()
  })
})
