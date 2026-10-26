import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, ref } from 'vue'
import { inView } from 'framer-motion/dom'
import { useInView } from '../use-in-view'

vi.mock('framer-motion/dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion/dom')>()
  return { ...actual, inView: vi.fn() }
})

describe('useInView', () => {
  it('resets when the observed element is removed or replaced', async () => {
    const enters = new Map<Element, () => () => void>()
    vi.mocked(inView).mockImplementation(((element: Element, onEnter: () => () => void) => {
      enters.set(element, onEnter)
      return vi.fn()
    }) as any)

    const show = ref(true)
    const key = ref(0)
    const root = ref<HTMLElement | null>(null)
    const options = ref({})
    let isInView: ReturnType<typeof useInView>
    mount({
      setup() {
        isInView = useInView(root, options)
        return () => show.value
          ? h('div', { key: key.value, ref: root })
          : h('span')
      },
    })
    await nextTick()

    const first = root.value!
    enters.get(first)!()
    expect(isInView!.value).toBe(true)

    options.value = {}
    await nextTick()
    expect(isInView!.value).toBe(true)

    key.value = 1
    await nextTick()
    expect(root.value).not.toBe(first)
    expect(isInView!.value).toBe(false)

    enters.get(root.value!)!()
    expect(isInView!.value).toBe(true)
    show.value = false
    await nextTick()
    expect(isInView!.value).toBe(false)
  })
})
