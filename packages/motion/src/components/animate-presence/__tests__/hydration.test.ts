/**
 * @vitest-environment jsdom
 */
import type { Ref, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, ref, vShow, withDirectives } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { AnimatePresence, Motion } from '@/components'
import { delay } from '@/shared/test'

// jsdom reports offsetParent === null for every element, so emulate the
// browser for connected nodes the way the other component tests do.
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  configurable: true,
  get(this: HTMLElement) {
    return this.isConnected ? document.body : null
  },
})

const itemProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25, ease: 'linear' },
  style: { width: '10px', height: '10px', background: 'red' },
}

function makeApp(renderChild: (shown: Ref<boolean>) => VNode) {
  const shown = ref(false)
  const App = defineComponent({
    setup() {
      return () => h(AnimatePresence, null, { default: () => renderChild(shown) })
    },
  })
  return { App, shown }
}

async function hydrate(App: ReturnType<typeof makeApp>['App']) {
  const html = await renderToString(createSSRApp(App))
  expect(html).toContain('display:none')

  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)

  createSSRApp(App).mount(container)
  await nextTick()
  await delay(150)
  return container
}

async function revealAndSample(el: HTMLElement, shown: Ref<boolean>) {
  shown.value = true
  await nextTick()

  const samples: number[] = []
  for (let i = 0; i < 15; i++) {
    samples.push(Number(el.style.opacity || 0))
    await delay(20)
  }
  await delay(100)
  return samples
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('animatePresence hydration', () => {
  it('keeps a hidden motion child in exit state and animates it in on reveal', async () => {
    const { App, shown } = makeApp(shown => withDirectives(
      h(Motion, { ...itemProps, id: 'hydrated-item' }),
      [[vShow, shown.value]],
    ))

    const container = await hydrate(App)
    const el = container.querySelector<HTMLElement>('#hydrated-item')!
    expect(el.isConnected).toBe(true)
    expect(el.style.opacity).not.toBe('')
    expect(Number(el.style.opacity)).toBeLessThan(0.1)

    const samples = await revealAndSample(el, shown)

    // Enter runs after hydration: the reveal fades in from the exit values.
    expect(Math.min(...samples)).toBeLessThan(0.5)
    expect(Number(el.style.opacity)).toBeGreaterThan(0.9)
  })

  it('animates a motion child inside a hidden wrapper in on reveal', async () => {
    const { App, shown } = makeApp(shown => withDirectives(
      h('div', { id: 'hydrated-wrapper' }, [h(Motion, { ...itemProps, id: 'wrapped-item' })]),
      [[vShow, shown.value]],
    ))

    const container = await hydrate(App)
    const el = container.querySelector<HTMLElement>('#wrapped-item')!
    expect(el.style.opacity).not.toBe('')
    expect(Number(el.style.opacity)).toBeLessThan(0.1)

    const samples = await revealAndSample(el, shown)

    expect(Math.min(...samples)).toBeLessThan(0.5)
    expect(Number(el.style.opacity)).toBeGreaterThan(0.9)
  })
})
