import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

type TestBrowser = Parameters<Parameters<typeof test>[2]>[0]['browser']

async function startDrag(browser: TestBrowser, testId: string, targetX: number, targetY: number) {
  const item = browser.locator(`[data-testid="${testId}"]`)
  const box = await item.boundingBox()
  expect(box).not.toBeNull()

  const startX = box!.x + box!.width / 2
  const startY = box!.y + box!.height / 2
  await browser.mouse.move(startX, startY)
  await browser.mouse.down()
  await browser.mouse.move(
    startX + Math.sign(targetX - startX) * Math.min(20, Math.abs(targetX - startX)),
    startY + Math.sign(targetY - startY) * Math.min(20, Math.abs(targetY - startY)),
  )
  await browser.mouse.move(targetX, targetY)

  return { startX, startY }
}

beforeEach(async ({ app, browser }) => {
  await app.open('/reorder/auto-scroll')
  await expect(browser.locator('[data-testid="scroll-container"]')).toBeVisible()
  await expect(browser.locator('[data-testid="0"]')).toBeVisible()
})

/**
 * Tests for Reorder auto-scroll feature.
 * Verifies that when dragging a reorder item near the edge of a scrollable
 * container, the container automatically scrolls.
 */
describe('Reorder auto-scroll', () => {
  test('Auto-scrolls down when dragging near bottom edge', { requires: ['browser'] }, async ({ browser }) => {
    const container = browser.locator('[data-testid="scroll-container"]')

    const initialScroll = await browser.evaluate(() => {
      return document.querySelector<HTMLElement>('[data-testid="scroll-container"]')?.scrollTop
    })
    expect(initialScroll).toBe(0)

    const containerBox = await container.boundingBox()
    expect(containerBox).not.toBeNull()

    const item0Box = await browser.locator('[data-testid="0"]').boundingBox()
    expect(item0Box).not.toBeNull()
    const startX = item0Box!.x + item0Box!.width / 2

    await startDrag(browser, '0', startX, containerBox!.y + containerBox!.height - 10)

    await expect.poll(() => browser.evaluate(() => {
      return document.querySelector<HTMLElement>('[data-testid="scroll-container"]')?.scrollTop
    }), { timeout: 5000 }).toBeGreaterThan(0)

    await browser.mouse.up()
  })

  test('Auto-scrolls up when dragging near top edge', { requires: ['browser'] }, async ({ browser }) => {
    const container = browser.locator('[data-testid="scroll-container"]')

    await browser.evaluate(() => {
      const element = document.querySelector<HTMLElement>('[data-testid="scroll-container"]')
      if (element)
        element.scrollTop = 200
    })
    await expect.poll(() => browser.evaluate(() => {
      return document.querySelector<HTMLElement>('[data-testid="scroll-container"]')?.scrollTop
    })).toBe(200)

    const item8 = browser.locator('[data-testid="8"]')
    await expect(item8).toBeAttached()
    await item8.scrollIntoView()
    const containerBox = await container.boundingBox()
    expect(containerBox).not.toBeNull()

    const item8Box = await item8.boundingBox()
    expect(item8Box).not.toBeNull()
    const startX = item8Box!.x + item8Box!.width / 2

    await startDrag(browser, '8', startX, containerBox!.y - 20)

    await expect.poll(() => browser.evaluate(() => {
      return document.querySelector<HTMLElement>('[data-testid="scroll-container"]')?.scrollTop
    }), { timeout: 5000 }).toBeLessThan(200)

    await browser.mouse.up()
  })

  test('Items remain draggable during and after auto-scroll', { requires: ['browser'] }, async ({ browser }) => {
    const container = browser.locator('[data-testid="scroll-container"]')
    const item0 = browser.locator('[data-testid="0"]')

    const initialBox = await item0.boundingBox()
    expect(initialBox).not.toBeNull()
    const containerBox = await container.boundingBox()
    expect(containerBox).not.toBeNull()

    const { startX } = await startDrag(
      browser,
      '0',
      initialBox!.x + initialBox!.width / 2,
      containerBox!.y + containerBox!.height - 10,
    )

    await expect.poll(() => browser.evaluate(() => {
      return document.querySelector<HTMLElement>('[data-testid="scroll-container"]')?.scrollTop
    }), { timeout: 5000 }).toBeGreaterThan(0)

    const scrolledDown = await browser.evaluate(() => {
      return document.querySelector<HTMLElement>('[data-testid="scroll-container"]')?.scrollTop
    })
    await browser.mouse.move(startX, containerBox!.y + 10)
    await expect.poll(() => browser.evaluate(() => {
      return document.querySelector<HTMLElement>('[data-testid="scroll-container"]')?.scrollTop
    }), { timeout: 5000 }).toBeLessThan(scrolledDown!)

    await browser.mouse.up()

    const finalBox = await item0.boundingBox()
    expect(finalBox).not.toBeNull()
  })

  test('Horizontal auto-scroll works correctly', { requires: ['browser'] }, async ({ browser }) => {
    const container = browser.locator('[data-testid="horizontal-scroll-container"]')

    const initialScroll = await browser.evaluate(() => {
      return document.querySelector<HTMLElement>('[data-testid="horizontal-scroll-container"]')?.scrollLeft
    })
    expect(initialScroll).toBe(0)

    await browser.locator('[data-testid="h-1-A"]').scrollIntoView()

    const containerBox = await container.boundingBox()
    expect(containerBox).not.toBeNull()

    const itemBox = await browser.locator('[data-testid="h-1-A"]').boundingBox()
    expect(itemBox).not.toBeNull()
    const startY = itemBox!.y + itemBox!.height / 2

    await startDrag(browser, 'h-1-A', containerBox!.x + containerBox!.width - 10, startY)

    await expect.poll(() => browser.evaluate(() => {
      return document.querySelector<HTMLElement>('[data-testid="horizontal-scroll-container"]')?.scrollLeft
    }), { timeout: 5000 }).toBeGreaterThan(0)

    await browser.mouse.up()
  })
})

/**
 * Additional basic tests to ensure page loads correctly
 */
describe('Reorder auto-scroll - Basic', () => {
  test('page should load with reorder components', { requires: ['browser'] }, async ({ browser }) => {
    await expect(browser.locator('[data-testid="scroll-container"]')).toBeVisible()
    await expect(browser.locator('[data-testid="horizontal-scroll-container"]')).toBeVisible()
    await expect(browser.locator('[data-testid="0"]')).toBeVisible()
  })
})
