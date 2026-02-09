import { describe, expect, it, vi } from 'vitest'
import { createAnimationState } from '../animation-state'
import type { VisualElement } from 'motion-dom'

/**
 * Create a minimal mock VisualElement for testing animation-state in isolation.
 * The mock has a `.state` property (MotionState) attached, matching how
 * AnimationFeature sets `(visualElement as any).state = motionState`.
 */
function createMockVisualElement(overrides: Record<string, any> = {}): VisualElement<Element> {
  const motionState = {
    options: {
      variants: {},
      ...overrides,
    },
    context: overrides.context ?? {},
    latestValues: overrides.latestValues ?? {},
  }

  return {
    variantChildren: overrides.variantChildren,
    manuallyAnimateOnMount: overrides.manuallyAnimateOnMount ?? false,
    blockInitialAnimation: overrides.blockInitialAnimation ?? false,
    // [Vue] MotionState is attached to visualElement as `.state`
    state: motionState,
  } as any
}

describe('createAnimationState', () => {
  describe('aPI shape', () => {
    it('returns { animateChanges, setActive, setAnimateFunction, getState, reset }', () => {
      const ve = createMockVisualElement()
      const animState = createAnimationState(ve)

      expect(animState).toHaveProperty('animateChanges')
      expect(animState).toHaveProperty('setActive')
      expect(animState).toHaveProperty('setAnimateFunction')
      expect(animState).toHaveProperty('getState')
      expect(animState).toHaveProperty('reset')
    })
  })

  describe('getState', () => {
    it('returns per-type state with correct initial values', () => {
      const ve = createMockVisualElement()
      const animState = createAnimationState(ve)
      const s = animState.getState()

      expect(s.animate.isActive).toBe(true)
      expect(s.whileHover.isActive).toBe(false)
      expect(s.whilePress.isActive).toBe(false)
      expect(s.whileDrag.isActive).toBe(false)
      expect(s.whileFocus.isActive).toBe(false)
      expect(s.whileInView.isActive).toBe(false)
      expect(s.exit.isActive).toBe(false)

      // Each type has protectedKeys, needsAnimating, prevResolvedValues
      for (const key of Object.keys(s)) {
        expect(s[key]).toHaveProperty('protectedKeys')
        expect(s[key]).toHaveProperty('needsAnimating')
        expect(s[key]).toHaveProperty('prevResolvedValues')
      }
    })
  })

  describe('animateChanges', () => {
    it('calls animate function with resolved animations', () => {
      const animateFn = vi.fn().mockReturnValue(Promise.resolve())
      const ve = createMockVisualElement({ animate: { opacity: 1 } })
      const animState = createAnimationState(ve)
      animState.setAnimateFunction(() => animateFn)

      animState.animateChanges()

      expect(animateFn).toHaveBeenCalled()
    })

    it('skips animation on initial render when initial === false', () => {
      const animateFn = vi.fn().mockReturnValue(Promise.resolve())
      const ve = createMockVisualElement({ initial: false, animate: { opacity: 1 } })
      const animState = createAnimationState(ve)
      animState.setAnimateFunction(() => animateFn)

      animState.animateChanges()

      expect(animateFn).not.toHaveBeenCalled()
    })

    it('skips animation when initial === animate', () => {
      const animateFn = vi.fn().mockReturnValue(Promise.resolve())
      const ve = createMockVisualElement({
        initial: 'visible',
        animate: 'visible',
        variants: { visible: { opacity: 1 } },
      })
      const animState = createAnimationState(ve)
      animState.setAnimateFunction(() => animateFn)

      animState.animateChanges()

      expect(animateFn).not.toHaveBeenCalled()
    })

    it('resolves variant labels through variants map', () => {
      const animateFn = vi.fn().mockReturnValue(Promise.resolve())
      const ve = createMockVisualElement({
        animate: 'visible',
        variants: { visible: { opacity: 1, x: 100 } },
      })
      const animState = createAnimationState(ve)
      animState.setAnimateFunction(() => animateFn)

      animState.animateChanges()

      expect(animateFn).toHaveBeenCalled()
      const animations = animateFn.mock.calls[0][0]
      expect(animations.length).toBeGreaterThan(0)
    })

    it('tracks prevResolvedValues per type', () => {
      const ve = createMockVisualElement({ animate: { opacity: 1 } })
      const animState = createAnimationState(ve)
      animState.setAnimateFunction(() => vi.fn().mockReturnValue(Promise.resolve()))

      animState.animateChanges()

      const s = animState.getState()
      expect(s.animate.prevResolvedValues).toEqual({ opacity: 1 })
    })
  })

  describe('setActive', () => {
    it('returns resolved promise when isActive has not changed', async () => {
      const animateFn = vi.fn().mockReturnValue(Promise.resolve())
      const ve = createMockVisualElement({ whileHover: { scale: 1.1 } })
      const animState = createAnimationState(ve)
      animState.setAnimateFunction(() => animateFn)

      // whileHover is already inactive, setting to false again
      await animState.setActive('whileHover', false)

      expect(animateFn).not.toHaveBeenCalled()
    })

    it('activates type and triggers animateChanges', () => {
      const animateFn = vi.fn().mockReturnValue(Promise.resolve())
      const ve = createMockVisualElement({ whileHover: { scale: 1.1 } })
      const animState = createAnimationState(ve)
      animState.setAnimateFunction(() => animateFn)

      // First call animateChanges to complete initial render
      animState.animateChanges()
      animateFn.mockClear()

      animState.setActive('whileHover', true)

      expect(animState.getState().whileHover.isActive).toBe(true)
      expect(animateFn).toHaveBeenCalled()
    })

    it('clears protectedKeys after animateChanges', () => {
      const ve = createMockVisualElement({
        animate: { scale: 1 },
        whileHover: { scale: 1.1 },
      })
      const animState = createAnimationState(ve)
      animState.setAnimateFunction(() => vi.fn().mockReturnValue(Promise.resolve()))

      animState.animateChanges()
      animState.setActive('whileHover', true)

      const s = animState.getState()
      for (const key of Object.keys(s)) {
        expect(s[key].protectedKeys).toEqual({})
      }
    })

    it('propagates to variantChildren', () => {
      const childAnimState = { setActive: vi.fn().mockReturnValue(Promise.resolve()) }
      const childVE = { animationState: childAnimState }
      const variantChildren = new Set([childVE])

      const ve = createMockVisualElement({
        whileHover: { scale: 1.1 },
        variantChildren,
      })
      const animState = createAnimationState(ve)
      animState.setAnimateFunction(() => vi.fn().mockReturnValue(Promise.resolve()))

      animState.animateChanges() // complete initial render
      animState.setActive('whileHover', true)

      expect(childAnimState.setActive).toHaveBeenCalledWith('whileHover', true)
    })
  })

  describe('reset', () => {
    it('resets all type states to defaults', () => {
      const ve = createMockVisualElement({ whileHover: { scale: 1.1 } })
      const animState = createAnimationState(ve)
      animState.setAnimateFunction(() => vi.fn().mockReturnValue(Promise.resolve()))

      animState.setActive('whileHover', true)
      animState.reset()

      const s = animState.getState()
      expect(s.whileHover.isActive).toBe(false)
      expect(s.animate.isActive).toBe(true)
    })
  })
})
