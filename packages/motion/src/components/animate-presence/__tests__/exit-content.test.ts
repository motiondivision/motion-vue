/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { AnimatePresence, Motion } from '@/components'
import { mountedStates } from '@/state/motion-state'
import { delay } from '@/shared/test'

/**
 * An exiting child must keep showing the content it had when it started
 * leaving, as React does by retaining the rendered element.
 *
 * Vue slots are lazy functions, so the vnode alone is not enough: patching it
 * calls the slot again and the closure reads the parent's *current* state.
 * These tests pin the freeze — and the `dirs` copy that keeps `v-show`
 * working on an exiting element.
 */
const tabs = [
  { icon: 'A', label: 'first' },
  { icon: 'B', label: 'second' },
]

/** Holds the exit open so the mid-exit state is observable. */
function holdExit(el: HTMLElement) {
  const state = mountedStates.get(el)! as any
  const pending: Array<() => void> = []
  state.visualElement.animationState.setActive = () =>
    new Promise<void>(resolve => pending.push(resolve))
  return () => pending.forEach(resolve => resolve())
}

function mountTabs() {
  const selected = ref(tabs[0])
  const wrapper = mount(defineComponent({
    setup: () => () => h(AnimatePresence, null, () => h(Motion, {
      'key': selected.value.label,
      'data-testid': 'page',
      'exit': { opacity: 0 },
      'transition': { duration: 0.05 },
    }, () => selected.value.icon)),
  }), { attachTo: document.body, global: { stubs: { Transition: false } } })
  return { selected, wrapper }
}

describe('exiting child content', () => {
  it('keeps the content it had when the exit started', async () => {
    const { selected, wrapper } = mountTabs()
    await nextTick()
    await delay(50)

    const el = document.querySelector('[data-testid="page"]') as HTMLElement
    expect(el.textContent).toBe('A')
    const release = holdExit(el)

    selected.value = tabs[1]
    await nextTick()
    await delay(50)

    // Still the same element mid-exit, still showing the old content.
    expect(document.querySelector('[data-testid="page"]')).toBe(el)
    expect(el.textContent).toBe('A')

    release()
    await delay(80)
    expect(el.isConnected).toBe(false)
    expect(document.querySelector('[data-testid="page"]')!.textContent).toBe('B')
    wrapper.unmount()
  })

  it('tracks parent state again after the exit finishes', async () => {
    const { selected, wrapper } = mountTabs()
    await nextTick()
    await delay(50)

    const el = document.querySelector('[data-testid="page"]') as HTMLElement
    const release = holdExit(el)

    selected.value = tabs[1]
    await nextTick()
    await delay(50)
    release()
    await delay(80)

    // The incoming child is not frozen: a further change reaches it.
    selected.value = tabs[0]
    await nextTick()
    await delay(50)
    const latest = document.querySelector('[data-testid="page"]') as HTMLElement
    expect(latest.textContent).toBe('A')
    wrapper.unmount()
  })

  it('still lets v-show flip back while exiting', async () => {
    const show = ref(true)
    const wrapper = mount(defineComponent({
      components: { AnimatePresence, Motion },
      setup: () => ({ show }),
      template: `
        <AnimatePresence>
          <Motion
            v-show="show"
            data-testid="toggle"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.05 }"
          >box</Motion>
        </AnimatePresence>`,
    }), { attachTo: document.body, global: { stubs: { Transition: false } } })
    await nextTick()
    await delay(50)

    const el = document.querySelector('[data-testid="toggle"]') as HTMLElement
    const release = holdExit(el)

    show.value = false
    await nextTick()
    await delay(30)
    expect(el.style.display).not.toBe('none')

    show.value = true
    await nextTick()
    await delay(30)

    // A stale exit settling after re-entry must not hide the element. This is
    // what the `dirs` copy on the rebuilt vnode protects — without it the
    // element never sees the flip back and stays hidden.
    release()
    await delay(30)
    expect(el.style.display).not.toBe('none')

    wrapper.unmount()
  })
})

describe('as-child with v-show', () => {
  /**
   * `<Motion as-child><div v-show>` puts the directive on the child vnode that
   * `asChild` unwraps. While an exit is frozen the vnode is rebuilt every
   * render, which leaves the directive reading a stale `value`, so the flip
   * back never reaches `beforeEnter` and the element stays hidden. Dropping the
   * freeze when the exit finishes is what keeps the toggle working.
   */
  it('shows the element again after a completed exit', async () => {
    const visible = ref(true)
    const wrapper = mount(defineComponent({
      components: { AnimatePresence, Motion },
      setup: () => ({ visible }),
      template: `
        <AnimatePresence>
          <Motion
            as-child
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.05 }"
          >
            <div v-show="visible" class="rect">x</div>
          </Motion>
        </AnimatePresence>`,
    }), { attachTo: document.body, global: { stubs: { Transition: false } } })
    await nextTick()
    await delay(60)

    const el = document.querySelector('.rect') as HTMLElement
    expect(el.style.display).not.toBe('none')

    visible.value = false
    await nextTick()
    await delay(150)
    expect(el.style.display).toBe('none')

    visible.value = true
    await nextTick()
    await delay(150)
    expect(el.style.display).not.toBe('none')

    wrapper.unmount()
  })
})
