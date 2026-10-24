import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

/**
 * Tests for Reorder axis auto-detection, grid ("xy") reordering and RTL.
 */

type TestBrowser = Parameters<Parameters<typeof test>[2]>[0]['browser']

async function getOrder(browser: TestBrowser): Promise<string> {
  return (await browser.locator('[data-testid="order"]').textContent())!.trim()
}

async function dragItemTo(browser: TestBrowser, testId: string, targetX: number, targetY: number) {
  const item = browser.locator(`[data-testid="${testId}"]`)
  const box = await item.boundingBox()
  expect(box).not.toBeNull()
  const startX = box!.x + box!.width / 2
  const startY = box!.y + box!.height / 2
  await browser.mouse.move(startX, startY)
  await browser.mouse.down()
  await browser.mouse.move(
    startX + Math.sign(targetX - startX) * Math.min(10, Math.abs(targetX - startX)),
    startY + Math.sign(targetY - startY) * Math.min(10, Math.abs(targetY - startY)),
  )
  await browser.mouse.move(targetX, targetY)
}

describe('Reorder basic (axis auto-detected)', () => {
  beforeEach(async ({ app, browser }) => {
    await app.open('/reorder')
    await expect(browser.locator('[data-testid="order"]')).toBeVisible()
  })

  test('reorders a vertical list without an explicit axis', { requires: ['browser'] }, async ({ browser }) => {
    expect(await getOrder(browser)).toBe('0,1,2,3,4,5')

    // Drag item 0 onto item 1's position
    const item1Box = await browser.locator('[data-testid="item-1"]').boundingBox()
    expect(item1Box).not.toBeNull()
    await dragItemTo(browser, 'item-0', item1Box!.x + item1Box!.width / 2, item1Box!.y + item1Box!.height / 2 + 4)

    await expect.poll(() => getOrder(browser)).toBe('1,0,2,3,4,5')
    await browser.mouse.up()

    // Order persists after release
    await expect.poll(() => getOrder(browser)).toBe('1,0,2,3,4,5')
  })
})

describe('Reorder axis auto-detection', () => {
  test('detects horizontal axis for a horizontal list', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/reorder/auto-detect')
    await expect(browser.locator('[data-testid="order"]')).toBeVisible()

    expect(await getOrder(browser)).toBe('0,1,2,3,4,5')

    // Drag item 0 onto item 1's position — only possible if the detected
    // axis is "x"
    const item1Box = await browser.locator('[data-testid="h-1"]').boundingBox()
    expect(item1Box).not.toBeNull()
    await dragItemTo(browser, 'h-0', item1Box!.x + item1Box!.width / 2 + 4, item1Box!.y + item1Box!.height / 2)

    await expect.poll(() => getOrder(browser)).toBe('1,0,2,3,4,5')
    await browser.mouse.up()
  })
})

describe('Reorder grid (axis="xy")', () => {
  test('reorders across lines in a wrapped grid', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/reorder/grid')
    await expect(browser.locator('[data-testid="order"]')).toBeVisible()

    expect(await getOrder(browser)).toBe('0,1,2,3,4,5')

    // Drag item 0 straight down into the second row (same column)
    const item0Box = await browser.locator('[data-testid="g-0"]').boundingBox()
    const item3Box = await browser.locator('[data-testid="g-3"]').boundingBox()
    expect(item0Box).not.toBeNull()
    expect(item3Box).not.toBeNull()
    await dragItemTo(
      browser,
      'g-0',
      item0Box!.x + item0Box!.width / 2,
      item3Box!.y + item3Box!.height / 2,
    )

    // LTR: item 0 is inserted before the item to its right on the new line
    await expect.poll(() => getOrder(browser)).toBe('1,2,3,0,4,5')
    await browser.mouse.up()
  })

  test('reorders within the same line', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/reorder/grid')
    await expect(browser.locator('[data-testid="order"]')).toBeVisible()

    // Drag item 0 onto item 1's position (same row)
    const item1Box = await browser.locator('[data-testid="g-1"]').boundingBox()
    expect(item1Box).not.toBeNull()
    await dragItemTo(browser, 'g-0', item1Box!.x + item1Box!.width / 2, item1Box!.y + item1Box!.height / 2)

    await expect.poll(() => getOrder(browser)).toBe('1,0,2,3,4,5')
    await browser.mouse.up()
  })
})

describe('Reorder RTL', () => {
  test('uses computed direction when inserting into another line', { requires: ['browser'] }, async ({ app, browser }) => {
    await app.open('/reorder/rtl')
    await expect(browser.locator('[data-testid="order"]')).toBeVisible()

    expect(await getOrder(browser)).toBe('0,1,2,3,4,5')

    // In RTL the first item is rightmost. Drag it straight down into the
    // second row without crossing any other item.
    const item0Box = await browser.locator('[data-testid="r-0"]').boundingBox()
    const item3Box = await browser.locator('[data-testid="r-3"]').boundingBox()
    expect(item0Box).not.toBeNull()
    expect(item3Box).not.toBeNull()
    await dragItemTo(
      browser,
      'r-0',
      item0Box!.x + item0Box!.width / 2,
      item3Box!.y + item3Box!.height / 2,
    )

    // With direction detection working, item 0 is inserted before the
    // visually-next item ("1,2,3,0,4,5"). If RTL detection were broken
    // (always "ltr"), the same gesture would append it to the end of the
    // line instead ("1,2,3,4,5,0").
    await expect.poll(() => getOrder(browser)).toBe('1,2,3,0,4,5')
    await browser.mouse.up()
  })
})
