/**
 * Upstream-parity tests for the animation state scheduler.
 *
 * These lock the motion-dom 13 semantics that the previous local port of
 * `createAnimationState` had drifted away from. They exercise the *wired*
 * path (AnimationFeature → ve.animationState), so they fail against the
 * local port and pass once the implementation is delegated to motion-dom.
 *
 * Covered drift points:
 * 1. Exit re-processing guard: a `custom` change mid-exit must not restart
 *    exit value animations.
 * 2. `wasReset` semantics: after reset(), the next animateChanges() behaves
 *    like upstream — re-applying targets even when initial === animate.
 * 3. Keyframes change detection: a variant-label change marks values as
 *    needing animation even when the resolved keyframes are shallow-equal.
 */
import { describe, expect, it, vi } from 'vitest'
import { AnimationFeature } from '@/features/animation/animation'

function createWiredVisualElement(props: Record<string, any>) {
  const ve: any = {
    props,
    parent: null,
    presenceContext: null,
    values: new Map(),
    variantChildren: new Set(),
    manuallyAnimateOnMount: false,
    blockInitialAnimation: false,
    getProps: () => ve.props,
    getValue: () => undefined,
    getBaseTarget: () => undefined,
  }
  // Wire the animation state the same way the runtime does
  // eslint-disable-next-line no-new -- the constructor attaches ve.animationState
  new AnimationFeature({ visualElement: ve } as any)
  return ve
}

function injectAnimateSpy(ve: any) {
  const animate = vi.fn(() => Promise.resolve([]))
  ve.animationState.setAnimateFunction(() => animate)
  return animate
}

describe('animation state — upstream parity', () => {
  it('does not restart exit value animations when custom changes mid-exit', async () => {
    const ve = createWiredVisualElement({
      exit: (custom: number) => ({ opacity: custom }),
    })
    const animate = injectAnimateSpy(ve)

    // Mount
    await ve.animationState.animateChanges()

    // Begin exit with custom = 0 → resolves to { opacity: 0 }
    ve.presenceContext = { custom: 0 }
    await ve.animationState.setActive('exit', true)
    expect(animate).toHaveBeenCalledTimes(1)

    // custom changes mid-exit (e.g. parent re-renders during leave)
    // and a fresh animateChanges() runs — exit must NOT be re-resolved
    ve.presenceContext = { custom: 1 }
    await ve.animationState.animateChanges()

    expect(animate).toHaveBeenCalledTimes(1)
  })

  it('re-applies animate targets after reset() even when initial === animate', async () => {
    const ve = createWiredVisualElement({
      initial: 'closed',
      animate: 'closed',
      variants: { closed: { opacity: 0 } },
    })
    const animate = injectAnimateSpy(ve)

    await ve.animationState.animateChanges()
    expect(animate).not.toHaveBeenCalled()

    ve.animationState.reset()
    await ve.animationState.animateChanges()

    // Upstream `wasReset` semantics: state was cleared, so resolved values
    // diff as changed and the target is re-applied — the initial-render
    // suppression gate (initial === animate) no longer applies.
    expect(animate).toHaveBeenCalledTimes(1)
  })

  it('marks keyframes as needing animation when the variant label changes to shallow-equal keyframes', async () => {
    const ve = createWiredVisualElement({
      animate: 'a',
      variants: {
        a: { x: [0, 100] },
        b: { x: [0, 100] },
      },
    })
    injectAnimateSpy(ve)

    await ve.animationState.animateChanges()

    // Isolate the next diff: the initial render already marked x.
    delete ve.animationState.getState().animate.needsAnimating.x

    ve.props = { ...ve.props, animate: 'b' }
    await ve.animationState.animateChanges()

    // Label changed while resolved keyframes are shallow-equal: upstream
    // treats the value as changed (variantDidChange) and marks it for
    // animation rather than protecting it.
    expect(ve.animationState.getState().animate.needsAnimating.x).toBe(true)
  })
})
