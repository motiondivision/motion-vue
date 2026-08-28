import { expect, test } from '@playwright/test'

/**
 * Regression test for mid-flight variant interruption.
 *
 * Sidebar demo (/gestures/hover): the `open` spring (stiffness 20) is very
 * slow, so closing 1.5s after opening interrupts it mid-flight. The close
 * spring (stiffness 400, damping 40 — critically damped) must then decrease
 * the clip-path radius monotonically from the current value.
 *
 * Any radius *increase* after the close starts is an upward flash — the
 * signature of the scheduler re-resolving/restarting value animations on
 * interruption (see the exit re-processing guard in motion-dom's
 * createAnimationState).
 */
test.describe('variant interruption', () => {
  test('rapid open→close interruption reverses smoothly without upward flashes', async ({ page }) => {
    await page.goto('/gestures/hover')
    await page.locator('.toggle-container').waitFor()

    // Open, then let the slow open spring run mid-flight
    await page.locator('.toggle-container').click()
    await page.waitForTimeout(1500)

    const frames = await page.evaluate(async () => {
      const el = document.querySelector('.background') as HTMLElement
      const out: Array<{ t: number, r: number }> = []
      const done = new Promise<void>(res => setTimeout(res, 4000))
      function tick(t: number) {
        const m = /circle\(([\d.]+)px/.exec(getComputedStyle(el).clipPath)
        if (m)
          out.push({ t: Math.round(t), r: +m[1] })
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      // Interrupt: close while the open spring is still running
      ;(document.querySelector('.toggle-container') as HTMLElement).click()
      await done
      return out
    })

    // We must have actually interrupted mid-flight (not after settling)
    expect(frames.length).toBeGreaterThan(10)

    // The close spring is critically damped: after a 200ms lead-in the
    // radius must never increase. A small tolerance absorbs sub-pixel
    // measurement noise; a real flash is tens of px.
    const upwardFlashes: string[] = []
    for (let i = 1; i < frames.length; i++) {
      const d = frames[i].r - frames[i - 1].r
      if (d > 1)
        upwardFlashes.push(`+${d.toFixed(1)}px at t=${frames[i].t}: ${frames[i - 1].r.toFixed(1)} -> ${frames[i].r.toFixed(1)}`)
    }
    expect(upwardFlashes, `upward flashes during close:\n${upwardFlashes.join('\n')}`).toEqual([])

    // And the close must actually complete (radius settles at 30px)
    expect(frames[frames.length - 1].r).toBeCloseTo(30, 0)
  })
})
