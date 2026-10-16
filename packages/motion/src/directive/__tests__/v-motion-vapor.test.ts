import { describe, expect, it, vi } from 'vitest'
import { createVaporApp, defineVaporComponent, nextTick, ref, template, withVaporDirectives } from 'vue'
import { mountedStates } from '@/state'
import { delay } from '@/shared/test'
import { vMotionVapor } from '../vapor'
import type { VaporMotionDirective } from '../vapor'

function mountVapor(options: () => Record<string, any>, directive: VaporMotionDirective = vMotionVapor) {
  const t0 = template('<div data-testid="box">hello</div>', 1)
  const App = defineVaporComponent(() => {
    const n0 = t0() as HTMLElement
    withVaporDirectives(n0, [[directive, options]])
    return n0
  })
  const container = document.createElement('div')
  document.body.appendChild(container)
  const app = createVaporApp(App)
  app.mount(container)
  return { app, el: container.querySelector('[data-testid="box"]') as HTMLElement }
}

describe('v-motion vapor directive', () => {
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
