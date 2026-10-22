import { expect, test } from '@playwright/test'

test.describe('AnimatePresence examples', () => {
  test('custom drives the exit direction', async ({ page }) => {
    await page.goto('/animate-presence/custom', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('#page-overview')).toBeVisible()

    await page.locator('#next').click()
    await expect(page.locator('#page-activity')).toBeVisible()
    await expect(page.locator('#page-overview')).toHaveCount(0)

    await page.locator('#prev').click()
    await expect(page.locator('#page-overview')).toBeVisible()
    await expect(page.locator('#page-activity')).toHaveCount(0)
  })

  test('usePresence holds removal until safeToRemove', async ({ page }) => {
    await page.goto('/animate-presence/use-presence', { waitUntil: 'domcontentloaded' })

    const toast = page.getByText('Deployment finished')
    await expect(toast).toBeVisible()

    await page.getByRole('button', { name: 'Dismiss' }).click()

    // The child is already out of the data set but stays mounted.
    await expect(page.getByText('waiting for safeToRemove')).toBeVisible()
    await expect(toast).toBeVisible()

    await expect(toast).toHaveCount(0, { timeout: 3000 })
    await expect(page.getByText('No notifications. Add one to try the exit.')).toBeVisible()
  })

  test('keyed list add and remove', async ({ page }) => {
    await page.goto('/animate-presence/list', { waitUntil: 'domcontentloaded' })

    const rows = page.locator('#task-list li')
    await expect(rows).toHaveCount(2)

    await page.locator('#add-task').click()
    await expect(rows).toHaveCount(3)

    await rows.first().getByRole('button', { name: 'Remove' }).click()
    await expect(rows).toHaveCount(2)
  })
})
