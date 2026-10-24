import { expect, test } from '@playwright/test'

/**
 * Live smoke test for the scenario overview page. Every section is driven
 * once, so a broken demo fails here rather than only on screen.
 */
test.describe('AnimatePresence scenario overview', () => {
  test('v-if section removes the card and fires exit-complete', async ({ page }) => {
    await page.goto('/animate-presence/scenarios', { waitUntil: 'domcontentloaded' })
    const card = page.locator('#scenario-if-card')
    await expect(card).toBeVisible()

    await page.locator('#scenario-if-toggle').click()
    await expect(card).toHaveCount(0, { timeout: 3000 })
    await expect(page.locator('#scenario-if-count')).toContainText('exits 1')
  })

  test('v-show section hides without unmounting and reverses on re-show', async ({ page }) => {
    await page.goto('/animate-presence/scenarios', { waitUntil: 'domcontentloaded' })
    const card = page.locator('#scenario-show-card')
    await expect(card).toBeVisible()

    await page.locator('#scenario-show-toggle').click()
    await expect(card).toBeHidden({ timeout: 3000 })
    // v-show keeps the node: it must still be attached to the document.
    await expect(card).toHaveCount(1)

    await page.locator('#scenario-show-toggle').click()
    await expect(card).toBeVisible({ timeout: 3000 })
  })

  test('KeepAlive section swaps cached roots', async ({ page }) => {
    await page.goto('/animate-presence/scenarios', { waitUntil: 'domcontentloaded' })
    const panel = page.locator('#scenario-cache-toggle')
    await expect(panel).toContainText('Swap to B')
    await panel.click()
    await expect(panel).toContainText('Swap to A', { timeout: 3000 })
  })

  test('keyed list adds and drops rows', async ({ page }) => {
    await page.goto('/animate-presence/scenarios', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#scenario-list li')).toHaveCount(2)

    await page.locator('#scenario-list-add').click()
    await expect(page.locator('#scenario-list li')).toHaveCount(3)

    await page.locator('#scenario-drop-one').click()
    await expect(page.locator('#scenario-list li')).toHaveCount(2, { timeout: 3000 })
  })

  test('wait mode replaces the page after the outgoing one leaves', async ({ page }) => {
    await page.goto('/animate-presence/scenarios', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#scenario-page-0')).toBeVisible()

    await page.locator('#scenario-wait-1').click()
    await expect(page.locator('#scenario-page-1')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('#scenario-page-0')).toHaveCount(0)
  })

  test('nested presence exits the swatch while the card stays', async ({ page }) => {
    await page.goto('/animate-presence/scenarios', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#swatch-card-mint')).toBeVisible()

    await page.locator('#swatch-amber').click()
    await expect(page.locator('#swatch-card-amber')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('#swatch-card-mint')).toHaveCount(0)
    // The outer card must survive the inner swap.
    await expect(page.locator('#nested-inner-card')).toBeVisible()
  })

  test('inner v-show keeps working inside an exiting v-if subtree', async ({ page }) => {
    await page.goto('/animate-presence/scenarios', { waitUntil: 'domcontentloaded' })
    const inner = page.locator('#nested-v-show')
    await expect(inner).toBeVisible()

    await page.locator('#nested-v-show-toggle').click()
    await expect(inner).toBeHidden({ timeout: 3000 })
    await page.locator('#nested-v-show-toggle').click()
    await expect(inner).toBeVisible({ timeout: 3000 })
  })

  test('outer Transition removes its container while row exits stay inner', async ({ page }) => {
    await page.goto('/animate-presence/scenarios', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#outer-container')).toBeVisible()

    await page.locator('#drop-alpha').click()
    await expect(page.locator('#row-alpha')).toHaveCount(0, { timeout: 3000 })
    await expect(page.locator('#row-beta')).toBeVisible()

    await page.locator('#outer-toggle').click()
    await expect(page.locator('#outer-container')).toHaveCount(0, { timeout: 3000 })
  })
})
