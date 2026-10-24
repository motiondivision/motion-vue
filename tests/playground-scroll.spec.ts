import { expect, test } from '@playwright/test'

test('returning to the home page restores its scroll position', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)

  const card = page.locator('a[href="/animate-presence"]')
  // Bring the card into view first: Playwright would otherwise scroll to it
  // during the click, which changes the offset we mean to preserve.
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(100)
  const homeScroll = await page.evaluate(() => window.scrollY)
  expect(homeScroll).toBeGreaterThan(0)

  await card.click()
  await page.waitForURL(url => url.pathname === '/animate-presence')
  await page.waitForTimeout(400)
  // A demo opens at the top, not at the hub's last offset.
  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  await page.getByRole('link', { name: '← 返回示例' }).click()
  await page.waitForURL(url => url.pathname === '/')
  await page.waitForTimeout(400)

  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(homeScroll, 0)
})
