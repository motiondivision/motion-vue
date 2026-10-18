import { describe, expect, it, vi } from 'vitest'
import { createComponent, createVaporApp, defineVaporComponent, nextTick, ref, vaporInteropPlugin } from 'vue'
import { Motion, mountedStates } from '@/components'
import { delay } from '@/shared/test'

function mountVapor(options: () => Record<string, any>) {
  const App = defineVaporComponent(() => createComponent(Motion as any, {
    'data-testid': 'box',
    'initial': () => options().initial,
    'animate': () => options().animate,
    'transition': () => options().transition,
  }))
  const container = document.createElement('div')
  document.body.appendChild(container)
  const app = createVaporApp(App)
  app.use(vaporInteropPlugin)
  app.mount(container)
  return { app, el: container.querySelector('[data-testid="box"]') as HTMLElement }
}

describe('motion component in a vapor app', () => {
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

  it('updates state when a reactive prop changes', async () => {
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
