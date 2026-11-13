import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MotionState } from '@/state'
import type { ExitSessionConfig } from '../exit-session'
import { createExitSession } from '../exit-session'

function createFakeState(el: Element | null = null) {
  let resolveExit!: () => void
  const exitPromise = new Promise<void>((resolve) => {
    resolveExit = resolve
  })
  const exit = vi.fn(() => exitPromise)
  const reenter = vi.fn()
  const state = {
    element: el,
    getFeature: vi.fn(() => ({ exit, reenter })),
    getSnapshot: vi.fn(),
    unmount: vi.fn(),
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
    const a = createFakeState(el)
    const b = createFakeState(el)
    const done = vi.fn()

    sessions.register(a.state)
    sessions.register(b.state)
    sessions.exit(el, done)

    expect(a.exit).toHaveBeenCalledTimes(1)
    expect(b.exit).toHaveBeenCalledTimes(1)
    expect(done).not.toHaveBeenCalled()
  })

  it('finalizes only after every exit promise resolves (fan-in)', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const a = createFakeState(el)
    const b = createFakeState(el)
    const done = vi.fn()

    sessions.register(a.state)
    sessions.register(b.state)
    sessions.exit(el, done)
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
    const a = createFakeState(el)
    const done = vi.fn()

    sessions.register(a.state)
    sessions.exit(el, done)
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
    const a = createFakeState(el)
    const done = vi.fn()

    sessions.register(a.state)
    sessions.exit(el, done)
    a.resolveExit()
    await flush()

    expect(a.state.unmount).not.toHaveBeenCalled()
    document.body.removeChild(el)
  })

  it('abort cancels a session: resolving exits finalize nothing', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const a = createFakeState(el)
    const done = vi.fn()

    sessions.register(a.state)
    sessions.exit(el, done)
    sessions.enter(el, vi.fn())
    a.resolveExit()
    await flush()

    expect(done).not.toHaveBeenCalled()
    expect(a.state.unmount).not.toHaveBeenCalled()
    expect(config.onAllComplete).not.toHaveBeenCalled()
  })

  it('abort without a session is a no-op', () => {
    const sessions = createExitSession(createConfig())
    expect(() => sessions.enter(document.createElement('div'), vi.fn())).not.toThrow()
  })

  it('a container can be tracked again after abort', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const first = createFakeState(el)
    const second = createFakeState(el)

    sessions.register(first.state)
    sessions.exit(el, vi.fn())
    sessions.enter(el, vi.fn())
    sessions.unregister(first.state)

    const done = vi.fn()
    sessions.register(second.state)
    sessions.exit(el, done)
    second.resolveExit()
    await flush()

    expect(done).toHaveBeenCalledTimes(1)
    expect(config.onAllComplete).toHaveBeenCalledTimes(1)
  })

  it('dispose unmounts every still-tracked state', () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const first = document.createElement('div')
    const second = document.createElement('div')
    const a = createFakeState(first)
    const b = createFakeState(second)

    sessions.register(a.state)
    sessions.exit(first, vi.fn())
    sessions.register(b.state)
    sessions.exit(second, vi.fn())
    sessions.dispose()

    expect(a.state.unmount).toHaveBeenCalledTimes(1)
    expect(b.state.unmount).toHaveBeenCalledTimes(1)
  })

  it('dispose aborts in-flight sessions without running done or onExitComplete', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const a = createFakeState(el)
    const done = vi.fn()

    sessions.register(a.state)
    sessions.exit(el, done)
    sessions.dispose()
    a.resolveExit()
    await flush()

    expect(done).not.toHaveBeenCalled()
    expect(config.onAllComplete).not.toHaveBeenCalled()
  })

  it('dispose removes popLayout styles for sessions still in flight', async () => {
    const config = createConfig({ props: { mode: 'popLayout', anchorX: 'left' } })
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const a = createFakeState(el)

    sessions.register(a.state)
    sessions.exit(el, vi.fn())
    sessions.dispose()
    await new Promise(resolve => setTimeout(resolve, 50))

    const leftover = Array.from(document.head.querySelectorAll('style'))
      .some(s => s.sheet?.cssRules[0]?.cssText.includes('data-motion-pop-id'))
    expect(leftover).toBe(false)
  })

  it('a late finalize does not orphan the current session', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const a = createFakeState(el)
    const b = createFakeState(el)

    sessions.register(a.state)
    sessions.exit(el, vi.fn())
    sessions.register(b.state)
    sessions.exit(el, vi.fn())

    a.resolveExit()
    await flush()

    sessions.dispose()
    expect(b.state.unmount).toHaveBeenCalledTimes(1)
  })

  it('tracking the same element twice keeps waiting on the original exit', async () => {
    const config = createConfig()
    const sessions = createExitSession(config)
    const el = document.createElement('div')
    const a = createFakeState(el)
    const firstDone = vi.fn()
    const secondDone = vi.fn()

    sessions.register(a.state)
    sessions.exit(el, firstDone)
    sessions.exit(el, secondDone)

    a.resolveExit()
    await flush()

    expect(firstDone).not.toHaveBeenCalled()
    expect(secondDone).toHaveBeenCalledTimes(1)
    expect(config.onAllComplete).toHaveBeenCalledTimes(1)
  })

  describe('popLayout mode', () => {
    it('injects an absolute-position style on track and removes it on finalize', async () => {
      const config = createConfig({ props: { mode: 'popLayout', anchorX: 'left' } })
      const sessions = createExitSession(config)
      const el = document.createElement('div')
      const a = createFakeState(el)

      sessions.register(a.state)
      sessions.exit(el, vi.fn())

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
      const a = createFakeState(el)

      sessions.register(a.state)
      sessions.exit(el, vi.fn())

      expect(el.dataset.motionPopId).toBeUndefined()
    })

    it('abort removes the pop style', async () => {
      const config = createConfig({ props: { mode: 'popLayout', anchorX: 'left' } })
      const sessions = createExitSession(config)
      const el = document.createElement('div')
      const a = createFakeState(el)

      sessions.register(a.state)
      sessions.exit(el, vi.fn())
      sessions.enter(el, vi.fn())
      await new Promise(resolve => setTimeout(resolve, 50))

      const leftover = Array.from(document.head.querySelectorAll('style'))
        .some(s => s.sheet?.cssRules[0]?.cssText.includes('data-motion-pop-id'))
      expect(leftover).toBe(false)
    })

    it('injects the pop style into the element\'s own document', () => {
      const config = createConfig({ props: { mode: 'popLayout', anchorX: 'left' } })
      const sessions = createExitSession(config)
      const otherDoc = document.implementation.createHTMLDocument('pop')
      const el = otherDoc.createElement('div')
      otherDoc.body.appendChild(el)
      const a = createFakeState(el)

      sessions.register(a.state)
      sessions.exit(el, vi.fn())

      const hasPopRule = (doc: Document) =>
        Array.from(doc.head.querySelectorAll('style'))
          .some(s => s.sheet?.cssRules[0]?.cssText.includes(el.dataset.motionPopId!))
      expect(hasPopRule(otherDoc)).toBe(true)
      expect(hasPopRule(document)).toBe(false)
    })
  })
})
