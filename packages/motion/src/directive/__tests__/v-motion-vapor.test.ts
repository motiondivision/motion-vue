import { describe, expect, it, vi } from 'vitest'
import { createVaporApp, defineVaporComponent, nextTick, ref, template, withVaporDirectives } from 'vue'
import { mountedStates } from '@/state'
import { delay } from '@/shared/test'
import { MotionPlugin } from '@/directive'
import type { VaporMotionDirective } from '../vapor'

/**
 * Public vapor path: MotionPlugin on createVaporApp registers the function
 * directive. No separate createVaporMotionDirective / vMotionVapor export.
 */
function resolveVaporMotionDirective(): VaporMotionDirective {
  const probe = createVaporApp(() => document.createElement('div'))
  probe.use(MotionPlugin)
  const dir = probe._context.directives.motion as VaporMotionDirective | undefined
  if (!dir || typeof dir !== 'function')
    throw new Error('MotionPlugin did not register a vapor function directive')
  return dir
}

function mountVapor(options: () => Record<string, any>) {
  const dir = resolveVaporMotionDirective()
  const t0 = template('<div data-testid="box">hello</div>', 1)
  const App = defineVaporComponent(() => {
    const n0 = t0() as HTMLElement
    withVaporDirectives(n0, [[dir, options]])
    return n0
  })
  const container = document.createElement('div')
  document.body.appendChild(container)
  const app = createVaporApp(App)
  app.use(MotionPlugin)
  app.mount(container)
  return { app, el: container.querySelector('[data-testid="box"]') as HTMLElement }
}

describe('v-motion via MotionPlugin under vapor', () => {
  it('motionPlugin registers a function directive on vapor apps', () => {
    const app = createVaporApp(() => document.createElement('div'))
    app.use(MotionPlugin)
    expect(typeof app._context.directives.motion).toBe('function')
  })

  it('applies initial styles to element', async () => {
    const { app, el } = mountVapor(() => ({ initial: { opacity: 0.5, y: 20 } }))
    await nextTick()
    expect(document.body.contains(el)).toBe(true)
    expect(el.style.opacity).toBe('0.5')
    expect(el.style.transform).toContain('translateY(20px)')
    app.unmount()
  })

  it('animates from initial to animate', async () => {
    const { app, el } = mountVapor(() => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.05 },
    }))
    await nextTick()
    expect(el.style.opacity).toBe('0')
    await delay(200)
    expect(Number(el.style.opacity)).toBe(1)
    app.unmount()
  })

  it('updates state when the reactive binding value changes', async () => {
    const x = ref(0)
    const { app, el } = mountVapor(() => ({
      animate: { x: x.value },
      transition: { duration: 0.05 },
    }))
    await nextTick()
    x.value = 100
    await nextTick()
    await delay(200)
    expect(el.style.transform).toContain('translateX(100px)')
    app.unmount()
  })

  it('unmounts motion state when the app unmounts', async () => {
    const { app, el } = mountVapor(() => ({ animate: { opacity: 1 } }))
    await nextTick()
    const state = mountedStates.get(el)
    expect(state).toBeTruthy()
    const unmountSpy = vi.spyOn(state!, 'unmount')
    app.unmount()
    expect(unmountSpy).toHaveBeenCalled()
  })
})
