import { expect, test } from '@playwright/test'

test('built library toggles empty fx attributes and selector membership', async ({ page }) => {
  await page.goto('/fx')
  const targets = ['component-marker', 'svg-marker', 'input-marker']
  const toggle = page.getByRole('button', { name: 'Toggle fx markers' })
  for (const enabled of [true, false, true, false, true]) {
    await expect(toggle).toHaveAttribute('aria-pressed', String(enabled))
    for (const target of targets) {
      const element = page.getByTestId(target)
      if (enabled)
        await expect(element).toHaveAttribute('fx', '')
      else
        await expect(element).not.toHaveAttribute('fx')
      await expect(page.locator(`[data-testid="${target}"][fx]`)).toHaveCount(enabled ? 1 : 0)
    }
    await toggle.click()
  }
})

test('an existing m instance starts animating after delayed features resolve', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/fx')
  const box = page.getByTestId('lazy-marker')
  await expect(box).toHaveAttribute('fx', '')
  await expect(box).toHaveCSS('opacity', '0.25')
  await expect(page.getByRole('status')).toHaveText('Waiting for features')
  const original = await box.elementHandle()
  await page.getByRole('button', { name: 'Load animation features' }).click()
  await expect(page.getByRole('status')).toHaveText('Animation complete')
  await expect(box).toHaveCSS('opacity', '1')
  await expect(box).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 120, 0)')
  await expect(box).toHaveCount(1)
  expect(await box.evaluate((node, original) => node === original, original)).toBe(true)
  expect(errors).toEqual([])
})
