import { beforeEach, describe, test } from '@e2e-dev/web'
import { expect } from 'e2e'

describe('animateView', () => {
  beforeEach(async ({ app }) => {
    await app.open('/animate-view')
  })

  test('plays exit and enter animations on toggle', { requires: ['browser'] }, async ({ browser }) => {
    const box = browser.locator('#box')
    const toggle = browser.locator('#toggle')
    const status = browser.locator('#status')

    await expect(box).toBeVisible()

    await toggle.click()
    await expect(status).toHaveText('exit', { timeout: 3000 })
    await expect(box).toHaveCount(0)

    await toggle.click()
    await expect(status).toHaveText('enter', { timeout: 3000 })
    await expect(box).toBeVisible()
  })

  test('runs native view transition pseudo-element animations', { requires: ['browser'] }, async ({ browser }) => {
    // WebKit doesn't expose ::view-transition pseudo-element animations via
    // document.getAnimations(), so this assertion only runs on Chromium.
    const isWebKit = await browser.evaluate(() => {
      const ua = navigator.userAgent
      return ua.includes('AppleWebKit') && !/(?:Chrome|Chromium|Edg|OPR)\//.test(ua)
    })
    test.skip(isWebKit, 'WebKit does not expose view transition pseudo-element animations')

    await browser.locator('#slow-toggle').click()

    // The 2s transition should still be running: pseudo-element animations exist
    await expect.poll(() => browser.evaluate(() => {
      return document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return effect?.pseudoElement?.startsWith('::view-transition') ?? false
      })
    })).toBe(true)

    await expect(browser.locator('#slow-box')).toHaveCount(0)
  })

  test('suppresses the root layer so unnamed content does not crossfade', { requires: ['browser'] }, async ({ browser }) => {
    // WebKit doesn't expose ::view-transition pseudo-element animations via
    // document.getAnimations(), so this assertion only runs on Chromium.
    const isWebKit = await browser.evaluate(() => {
      const ua = navigator.userAgent
      return ua.includes('AppleWebKit') && !/(?:Chrome|Chromium|Edg|OPR)\//.test(ua)
    })
    test.skip(isWebKit, 'WebKit does not expose view transition pseudo-element animations')

    await browser.locator('#slow-toggle').click()

    // The 2s transition should still be running
    await expect.poll(() => browser.evaluate(() => {
      return document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return effect?.pseudoElement?.startsWith('::view-transition') ?? false
      })
    })).toBe(true)

    const hasRootNewLayer = await browser.evaluate(() => {
      return document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return effect?.pseudoElement === '::view-transition-new(root)'
      })
    })
    expect(hasRootNewLayer).toBe(false)
  })

  test('applies Motion spring timing to update morphs', { requires: ['browser'] }, async ({ browser }) => {
    // WebKit doesn't expose ::view-transition pseudo-element animations via
    // document.getAnimations(), so this assertion only runs on Chromium.
    const isWebKit = await browser.evaluate(() => {
      const ua = navigator.userAgent
      return ua.includes('AppleWebKit') && !/(?:Chrome|Chromium|Edg|OPR)\//.test(ua)
    })
    test.skip(isWebKit, 'WebKit does not expose view transition pseudo-element animations')

    await browser.locator('#update-toggle').click()

    await expect.poll(() => browser.evaluate(() => {
      return document.getAnimations().some((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return effect?.pseudoElement?.includes('group(motion-view-') ?? false
      })
    })).toBe(true)

    const result = await browser.evaluate(() => {
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

  test('animates shared elements between boundaries with the same name', { requires: ['browser'] }, async ({ browser }) => {
    const shareItem = browser.locator('#share-item')
    const shareModal = browser.locator('#share-modal')

    await expect(shareItem).toBeVisible()

    await browser.locator('#share-toggle').click()
    await expect(browser.locator('#status')).toHaveText('share', { timeout: 3000 })
    await expect(shareItem).toHaveCount(0)
    await expect(shareModal).toBeVisible()
  })
})
