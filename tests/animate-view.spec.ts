import { expect, test } from '@playwright/test'

test.describe('animateView', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/animate-view')
  })

  test('plays exit and enter animations on toggle', async ({ page }) => {
    await expect(page.locator('#box')).toBeVisible()

    await page.click('#toggle')
    await expect(page.locator('#status')).toHaveText('exit', { timeout: 3000 })
    await expect(page.locator('#box')).toHaveCount(0)

    await page.click('#toggle')
    await expect(page.locator('#status')).toHaveText('enter', { timeout: 3000 })
    await expect(page.locator('#box')).toBeVisible()
  })

  test('runs native view transition pseudo-element animations', async ({ page, browserName }) => {
    // WebKit doesn't expose ::view-transition pseudo-element animations via
    // document.getAnimations(), so this assertion only runs on Chromium
    test.skip(browserName === 'webkit', 'WebKit does not expose view transition pseudo-element animations')

    await page.click('#slow-toggle')

    // The 2s transition should still be running: pseudo-element animations exist
    await page.waitForFunction(() => {
      return document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return effect?.pseudoElement?.startsWith('::view-transition') ?? false
      })
    })

    await expect(page.locator('#slow-box')).toHaveCount(0)
  })

  test('suppresses the root layer so unnamed content does not crossfade', async ({ page, browserName }) => {
    // WebKit doesn't expose ::view-transition pseudo-element animations via
    // document.getAnimations(), so this assertion only runs on Chromium
    test.skip(browserName === 'webkit', 'WebKit does not expose view transition pseudo-element animations')

    await page.click('#slow-toggle')

    // The 2s transition should still be running
    await page.waitForFunction(() => {
      return document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return effect?.pseudoElement?.startsWith('::view-transition') ?? false
      })
    })

    const hasRootNewLayer = await page.evaluate(() => {
      return document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return effect?.pseudoElement === '::view-transition-new(root)'
      })
    })
    expect(hasRootNewLayer).toBe(false)
  })

  test('applies Motion spring timing to update morphs', async ({ page, browserName }) => {
    // WebKit doesn't expose ::view-transition pseudo-element animations via
    // document.getAnimations(), so this assertion only runs on Chromium
    test.skip(browserName === 'webkit', 'WebKit does not expose view transition pseudo-element animations')

    await page.click('#update-toggle')

    await page.waitForFunction(() => {
      return document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return effect?.pseudoElement?.includes('group(motion-view-') ?? false
      })
    })

    const result = await page.evaluate(() => {
      const box = document.querySelector('#update-box')
      const name = box ? getComputedStyle(box).viewTransitionName : ''
      const durations = document.getAnimations()
        .filter((animation) => {
          const effect = animation.effect as KeyframeEffect | null
          return effect?.pseudoElement === `::view-transition-group(${name})`
        })
        .map(animation => (animation.effect as KeyframeEffect).getComputedTiming().duration as number)
      return { name, durations }
    })

    // spring(visualDuration 0.3, bounce 0.2) retimes the morph — not the UA default 250ms
    expect(result.name).toMatch(/^motion-view-/)
    expect(result.durations.length).toBeGreaterThan(0)
    for (const duration of result.durations) {
      expect(duration).not.toBe(250)
    }
  })

  test('animates shared elements between boundaries with the same name', async ({ page }) => {
    await expect(page.locator('#share-item')).toBeVisible()

    await page.click('#share-toggle')
    await expect(page.locator('#status')).toHaveText('share', { timeout: 3000 })
    await expect(page.locator('#share-item')).toHaveCount(0)
    await expect(page.locator('#share-modal')).toBeVisible()
  })
})
