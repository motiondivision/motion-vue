import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MotionState } from '@/state'
import type { ExitSessionConfig } from '../exit-session'
import { createExitSession } from '../exit-session'

function createFakeState() {
  let resolveExit!: () => void
  const exitPromise = new Promise<void>((resolve) => {
    resolveExit = resolve
  })
  const exit = vi.fn(() => exitPromise)
  const state = {
    getFeature: vi.fn(() => ({ exit })),
    getSnapshot: vi.fn(),
    didUpdate: vi.fn(),
    unmount: vi.fn(),
    options: {},
  }
  return { state: state as unknown as MotionState, resolveExit, exit }
}

function createConfig(overrides: Partial<ExitSessionConfig> = {}) {
  return {
    props: { mode: 'sync', anchorX: 'left' },
    getNonce: () => undefined,
    onAllComplete: vi.fn(),
    ...overrides,
  } satisfies ExitSessionConfig
}

async function flush() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  document.head.querySelectorAll('style').forEach(s => s.remove())
  document.body.innerHTML = ''
})

describe('createExitSession', () => {
  it('starts exit on every tracked state', () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const a = createFakeState()
    const b = createFakeState()
    const done = vi.fn()

    sessions.track(el, [a.state, b.state], done)

    expect(a.exit).toHaveBeenCalledTimes(1)
    expect(b.exit).toHaveBeenCalledTimes(1)
    expect(done).not.toHaveBeenCalled()
  })

  it('finalizes only after every exit promise resolves (fan-in)', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const a = createFakeState()
    const b = createFakeState()
    const done = vi.fn()

    sessions.track(el, [a.state, b.state], done)
    a.resolveExit()
    await flush()
    expect(done).not.toHaveBeenCalled()
    expect(config.onAllComplete).not.toHaveBeenCalled()

    b.resolveExit()
    await flush()
    expect(done).toHaveBeenCalledTimes(1)
    expect(config.onAllComplete).toHaveBeenCalledTimes(1)
  })

  it('unmounts states on finalize when the element left the DOM', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const a = createFakeState()
    const done = vi.fn()

    sessions.track(el, [a.state], done)
    a.resolveExit()
    await flush()

    expect(el.isConnected).toBe(false)
    expect(a.state.unmount).toHaveBeenCalledTimes(1)
  })

  it('does not unmount when the element stays connected', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    document.body.appendChild(el)
    const a = createFakeState()
    const done = vi.fn()

    sessions.track(el, [a.state], done)
    a.resolveExit()
    await flush()

    expect(a.state.unmount).not.toHaveBeenCalled()
    document.body.removeChild(el)
  })

  it('abort cancels a session: resolving exits finalize nothing', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const a = createFakeState()
    const done = vi.fn()

    sessions.track(el, [a.state], done)
    sessions.abort(el)
    a.resolveExit()
    await flush()

    expect(done).not.toHaveBeenCalled()
    expect(a.state.unmount).not.toHaveBeenCalled()
    expect(config.onAllComplete).not.toHaveBeenCalled()
  })

  it('abort without a session is a no-op', () => {
    const sessions = createExitSession(createConfig())
    expect(() => sessions.abort(document.createElement('div'))).not.toThrow()
  })

  it('a container can be tracked again after abort', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const first = createFakeState()
    const second = createFakeState()

    sessions.track(el, [first.state], vi.fn())
    sessions.abort(el)

    const done = vi.fn()
    sessions.track(el, [second.state], done)
    second.resolveExit()
    await flush()

    expect(done).toHaveBeenCalledTimes(1)
    expect(config.onAllComplete).toHaveBeenCalledTimes(1)
  })

  it('dispose unmounts every still-tracked state', () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const a = createFakeState()
    const b = createFakeState()

    sessions.track(document.createElement('div'), [a.state], vi.fn())
    sessions.track(document.createElement('div'), [b.state], vi.fn())
    sessions.dispose()

    expect(a.state.unmount).toHaveBeenCalledTimes(1)
    expect(b.state.unmount).toHaveBeenCalledTimes(1)
  })

  describe('popLayout mode', () => {
    it('injects an absolute-position style on track and removes it on finalize', async () => {
      const config = createConfig({ props: { mode: 'popLayout', anchorX: 'left' } })
      const sessions = createExitSession(config)
      const el = document.createElement('div')
      const a = createFakeState()

      sessions.track(el, [a.state], vi.fn())

      expect(el.dataset.motionPopId).toMatch(/^pop-\d+$/)
      const style = Array.from(document.head.querySelectorAll('style'))
        .find(s => s.sheet?.cssRules[0]?.cssText.includes(el.dataset.motionPopId!))
      expect(style?.sheet?.cssRules[0]?.cssText).toContain('position: absolute !important')

      a.resolveExit()
      await flush()
      // Removal is deferred to the render frame
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(style?.isConnected).toBe(false)
    })

    it('does not inject styles in sync mode', () => {
      const config = createConfig()
      const sessions = createExitSession(config)
      const el = document.createElement('div')
      const a = createFakeState()

      sessions.track(el, [a.state], vi.fn())

      expect(el.dataset.motionPopId).toBeUndefined()
    })

    it('abort removes the pop style', async () => {
      const config = createConfig({ props: { mode: 'popLayout', anchorX: 'left' } })
      const sessions = createExitSession(config)
      const el = document.createElement('div')
      const a = createFakeState()

      sessions.track(el, [a.state], vi.fn())
      sessions.abort(el)
      await new Promise(resolve => setTimeout(resolve, 50))

      const leftover = Array.from(document.head.querySelectorAll('style'))
        .some(s => s.sheet?.cssRules[0]?.cssText.includes('data-motion-pop-id'))
      expect(leftover).toBe(false)
    })
  })
})
