import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/vue'
import { nextTick } from 'vue'
import type { ArcOptions, MotionPath } from 'motion-dom'
import { Motion } from '@/components'
import { arc } from '@/index'
import { delay } from '@/shared/test'

/**
 * Samples a curve through the public `arc().interpolateProjection()` hook.
 *
 * Mirrors motion's internal `createArcPath()` unit tests
 * (packages/motion-dom/src/animation/utils/__tests__/arc.test.ts), but
 * `createArcPath` is private — only `arc()` is exported. `interpolateProjection`
 * samples `from = {fromX, fromY}` to the layout origin `{0, 0}`, so a chord
 * "travelling right" is expressed as an element currently offset to the left
 * (`fromX < 0`) moving back to 0.
 */
function project(opts: ArcOptions, fromX: number, fromY: number) {
  const delta = { x: { translate: fromX }, y: { translate: fromY } } as any
  return arc(opts).interpolateProjection(delta)
}

describe('arc() interpolateProjection geometry', () => {
  it('returns the from point at t=0 and the layout origin at t=1', () => {
    const interp = project({ strength: 1 }, -200, 0)!
    expect(interp(0).x).toBeCloseTo(-200)
    expect(interp(0).y).toBeCloseTo(0)
    expect(interp(1).x).toBeCloseTo(0)
    expect(interp(1).y).toBeCloseTo(0)
  })

  it('strength=1 horizontal bulges perpendicular by ~half travel at t=0.5', () => {
    // 200px chord, strength 1 → bezier midpoint perpendicular offset ~100px.
    const mid = project({ strength: 1 }, -200, 0)!(0.5)
    expect(mid.x).toBeCloseTo(-100)
    expect(Math.abs(mid.y)).toBeCloseTo(100)
  })

  it('strength=0 produces a straight line at the midpoint', () => {
    const mid = project({ strength: 0 }, -200, 100)!(0.5)
    expect(mid.x).toBeCloseTo(-100)
    expect(mid.y).toBeCloseTo(50)
  })

  it('default strength (no options) produces a curve', () => {
    const mid = project({}, -200, 0)!(0.5)
    expect(Math.abs(mid.y)).toBeGreaterThan(0)
  })

  it('direction="cw" bulges the opposite side from "ccw"', () => {
    const cw = project({ strength: 1, direction: 'cw' }, -200, 0)!(0.5)
    const ccw = project({ strength: 1, direction: 'ccw' }, -200, 0)!(0.5)
    expect(Math.sign(cw.y)).toBe(-Math.sign(ccw.y))
  })

  it('auto direction bulges the same screen side across a clean reversal', () => {
    // Travelling right (offset left → 0) and left (offset right → 0) should
    // both bulge to the same screen-y side.
    const right = project({ strength: 1 }, -200, 0)!(0.5)
    const left = project({ strength: 1 }, 200, 0)!(0.5)
    expect(Math.sign(right.y)).toBe(Math.sign(left.y))
  })

  it('peak shifts the apex along the chord', () => {
    const early = project({ strength: 1, peak: 0.2 }, -200, 0)!(0.5)
    const late = project({ strength: 1, peak: 0.8 }, -200, 0)!(0.5)
    expect(early.x).toBeLessThan(late.x)
  })

  it('rotate false omits rotate', () => {
    expect(project({ strength: 1 }, -200, 0)!(0.5).rotate).toBeUndefined()
  })

  it('rotate true returns rotation normalized to 0 at the endpoints', () => {
    const interp = project({ strength: 1, rotate: true }, -200, 0)!
    expect(interp(0.5).rotate).toBeDefined()
    expect(interp(0).rotate).toBeCloseTo(0)
    expect(interp(1).rotate).toBeCloseTo(0)
  })

  it('rotate number scales rotation intensity', () => {
    const full = project({ strength: 1, rotate: 1 }, -200, 0)!(0.25)
    const half = project({ strength: 1, rotate: 0.5 }, -200, 0)!(0.25)
    expect(Math.abs(half.rotate!)).toBeCloseTo(Math.abs(full.rotate!) * 0.5)
  })

  it('does not arc for movements below the 20px minimum distance', () => {
    // 10px shift is under the layout floor → no interpolator, falls back to
    // the default straight-line projection.
    expect(arc({ strength: 1 }).interpolateProjection(
      { x: { translate: -10 }, y: { translate: 0 } } as any,
    )).toBeUndefined()
  })
})

describe('transition.path integration', () => {
  it('exports arc() returning a MotionPath with both hooks', () => {
    const path = arc()
    expect(typeof path.animateVisualElement).toBe('function')
    expect(typeof path.interpolateProjection).toBe('function')
  })

  it('routes transition.path into the keyframe pipeline (path hook is invoked)', async () => {
    const animateVisualElement = vi.fn()
    // A spy path: proves motion-v threads `transition.path` through to
    // motion-dom's animateTarget, which invokes the keyframe hook.
    const spyPath: MotionPath = {
      animateVisualElement,
      interpolateProjection: () => undefined,
    }

    render(Motion, {
      props: {
        animate: { x: 200, y: 100 },
        transition: { path: spyPath, duration: 0 },
      },
      attrs: { 'data-testid': 'motion' },
    })
    await nextTick()
    await delay(30)

    expect(animateVisualElement).toHaveBeenCalled()
    // target passed to the hook should carry the x/y the path will claim
    const target = animateVisualElement.mock.calls[0][1]
    expect(target).toMatchObject({ x: 200, y: 100 })
  })

  it('real arc() drives x/y to the target on completion', async () => {
    const wrapper = render(Motion, {
      props: {
        animate: { x: 200, y: 100 },
        transition: { path: arc(), duration: 0 },
      },
      attrs: { 'data-testid': 'motion' },
    })
    await nextTick()
    await delay(60)

    const el = wrapper.getByTestId('motion')
    // x/y are applied as translate transforms; on complete they settle on the
    // target (200, 100) regardless of the curved mid-path.
    expect(el.style.transform).toContain('200')
    expect(el.style.transform).toContain('100')
  })
})
