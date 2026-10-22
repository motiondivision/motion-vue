/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { AnimatePresence, Motion } from '@/components'
import { delay } from '@/shared/test'

/**
 * Parity with framer-motion's AnimatePresence custom contract.
 *
 * A variant label resolves through `animateVariant`, which reads
 * `presenceContext.custom` — so an exiting child sees AnimatePresence's
 * custom, never its own. A bare function `exit` prop is resolved twice: once
 * while diffing (with presence custom) and once while driving the animation
 * (with the element's own custom, `undefined` when absent). Both behaviours
 * match React; they are pinned here so neither drifts.
 */
function mountPresence(
  children: (show: any) => any,
  props: Record<string, any> = {},
) {
  const show = ref(true)
  const wrapper = mount(defineComponent({
    setup: () => () => h(AnimatePresence, props, () => children(show)),
  }), {
    attachTo: document.body,
    global: { stubs: { Transition: false } },
  })
  return { show, wrapper }
}

describe('animatePresence custom', () => {
  it('resolves exit variants with AnimatePresence custom, not the element\'s', async () => {
    const seen: number[] = []
    const { show, wrapper } = mountPresence(
      show => (show.value
        ? h(Motion, {
          key: 'page',
          custom: 1,
          variants: {
            exit: (dir: number) => {
              seen.push(dir)
              return { opacity: 0 }
            },
          },
          exit: 'exit',
          transition: { duration: 0.05 },
        })
        : null),
      { custom: 2 },
    )
    await nextTick()

    show.value = false
    await nextTick()
    await delay(100)

    expect(seen.length).toBeGreaterThan(0)
    expect(seen.every(dir => dir === 2)).toBe(true)
    wrapper.unmount()
  })

  it('resolves a bare function exit with presence custom while diffing, element custom when driving', async () => {
    const seen: any[] = []
    const { show, wrapper } = mountPresence(
      show => (show.value
        ? h(Motion, {
          key: 'page',
          custom: 'element',
          exit: (custom: any) => {
            seen.push(custom)
            return { opacity: 0 }
          },
          transition: { duration: 0.05 },
        })
        : null),
      { custom: 'presence' },
    )
    await nextTick()

    show.value = false
    await nextTick()
    await delay(100)

    expect(seen[0]).toBe('presence')
    expect(seen).toContain('element')
    wrapper.unmount()
  })
})
