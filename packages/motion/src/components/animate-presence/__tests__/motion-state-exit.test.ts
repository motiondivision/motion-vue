import { afterEach, describe, expect, it, vi } from 'vitest'
import { ExitFeature } from '@/features/exit/exit'
import { MotionState } from '@/state/motion-state'
import type { Options } from '@/types'

function createState(options: Partial<Options> = {}) {
  const state = new MotionState({ as: 'div', ...options } as Options)
  // One resolver per setActive call, in call order
  const animationResolvers: Array<() => void> = []
  const setActive = vi.fn(() => new Promise<void>((resolve) => {
    animationResolvers.push(resolve)
  }))
  state.visualElement = {
    animationState: { setActive },
    unmount: vi.fn(),
  } as any
  state.setBundle({ features: [ExitFeature] })
  const exitFeature = state.getFeature<ExitFeature>('exit')!
  return { state, exitFeature, setActive, animationResolvers }
}

async function flush() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  document.head.querySelectorAll('style').forEach(s => s.remove())
  document.body.innerHTML = ''
})

describe('exitFeature', () => {
  it('runs the exit sequence: activate exit, snapshot layout, resolve on completion', async () => {
    const { state, exitFeature, setActive, animationResolvers } = createState()
    const getSnapshot = vi.spyOn(state, 'getSnapshot')

    const completion = exitFeature.exit()

    expect(state.isExiting).toBe(true)
    expect(setActive).toHaveBeenCalledWith('exit', true)
    expect(getSnapshot).toHaveBeenCalledTimes(1)

    animationResolvers[0]()
    await completion
    expect(state.isExiting).toBe(false)
  })

  it('resolves immediately when there is no animation state', async () => {
    const { state, exitFeature } = createState()
    ;(state.visualElement as any).animationState = undefined
    await exitFeature.exit()
    expect(state.isExiting).toBe(false)
  })

  it('reenter settles the in-flight exit silently and deactivates exit', async () => {
    const { state, exitFeature, setActive, animationResolvers } = createState()
    const getSnapshot = vi.spyOn(state, 'getSnapshot')

    const completion = exitFeature.exit()
    exitFeature.reenter()

    // Stale exit promise resolves without completing; exit state is cleared
    await completion
    expect(state.isExiting).toBe(false)
    expect(setActive).toHaveBeenLastCalledWith('exit', false)
    // Exit and reenter each snapshot once
    expect(getSnapshot).toHaveBeenCalledTimes(2)

    // The stale exit's animation settling later must not clobber state
    animationResolvers[0]()
    await flush()
    expect(state.isExiting).toBe(false)
  })

  it('a second exit after reenter completes on its own terms', async () => {
    const { state, exitFeature, animationResolvers } = createState()

    const first = exitFeature.exit()
    exitFeature.reenter()
    await first

    const second = exitFeature.exit()
    expect(state.isExiting).toBe(true)

    // Stale animation from the first exit settles: must not affect the second
    animationResolvers[0]()
    await flush()
    expect(state.isExiting).toBe(true)

    // The second exit's own animation settles: reenter's setActive('exit', false)
    // is resolvers[1], the second exit is resolvers[2]
    animationResolvers[2]()
    await second
    expect(state.isExiting).toBe(false)
  })

  it('unmount settles a pending exit promise', async () => {
    const { state, exitFeature } = createState()
    const completion = exitFeature.exit()
    state.unmount()
    await completion
  })

  describe('layoutId handoff', () => {
    it('waits for the projection animation before resolving', async () => {
      const { state, exitFeature, animationResolvers } = createState({ layoutId: 'shared' })
      const projection = { currentAnimation: { state: 'running' } }
      ;(state.visualElement as any).projection = projection

      let resolved = false
      const completion = exitFeature.exit().then(() => {
        resolved = true
      })

      animationResolvers[0]()
      // Completion is deferred via frame.postRender
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(resolved).toBe(false)

      // Projection signals completion through the state itself
      projection.currentAnimation.state = 'finished'
      exitFeature.completeExitFromProjection()
      await completion
      expect(resolved).toBe(true)
    })

    it('completeExitFromProjection is a no-op while the exit animation is still running', async () => {
      const { state, exitFeature, animationResolvers } = createState({ layoutId: 'shared' })
      ;(state.visualElement as any).projection = { currentAnimation: { state: 'finished' } }

      let resolved = false
      const completion = exitFeature.exit().then(() => {
        resolved = true
      })

      exitFeature.completeExitFromProjection()
      await flush()
      expect(resolved).toBe(false)

      animationResolvers[0]()
      await new Promise(resolve => setTimeout(resolve, 50))
      await completion
      expect(resolved).toBe(true)
    })
  })
})
