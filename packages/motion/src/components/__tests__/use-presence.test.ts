/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, onUnmounted, ref, vShow, withDirectives } from 'vue'
import { AnimatePresence, usePresence } from '@/components'

/** A component with its own exit: a promise it resolves by hand. */
function createExiting() {
  let finish!: () => void
  const onExit = vi.fn(() => new Promise<void>(resolve => (finish = resolve)))
  const onEnter = vi.fn()
  const unmounted = vi.fn()
  const Exiting = defineComponent({
    setup() {
      const el = ref<HTMLElement>()
      usePresence({ element: () => el.value, onExit, onEnter })
      onUnmounted(unmounted)
      return () => h('div', { ref: el, class: 'exiting' })
    },
  })
  return { Exiting, onExit, onEnter, unmounted, finish: () => finish() }
}

function render(child: ReturnType<typeof defineComponent>) {
  const show = ref(true)
  const wrapper = mount(defineComponent({
    setup: () => () => h(AnimatePresence, null, () => show.value ? h(child, { key: 'a' }) : null),
  }), { attachTo: document.body, global: { stubs: { Transition: false, TransitionGroup: false } } })
  return { show, wrapper }
}

describe('usePresence', () => {
  it('keeps the element until its exit resolves', async () => {
    const { Exiting, onExit, unmounted, finish } = createExiting()
    const { show, wrapper } = render(Exiting)
    await nextTick()

    show.value = false
    await nextTick()
    expect(onExit).toHaveBeenCalledTimes(1)
    // Vue unmounts the component at once; the element waits for the exit.
    expect(unmounted).toHaveBeenCalled()
    expect(document.querySelector('.exiting')).not.toBeNull()

    finish()
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()
    expect(document.querySelector('.exiting')).toBeNull()
    wrapper.unmount()
  })

  it('runs onEnter when a v-show element comes back mid-exit', async () => {
    const { Exiting, onExit, onEnter } = createExiting()
    const show = ref(true)
    const wrapper = mount(defineComponent({
      setup: () => () => h(AnimatePresence, null, () => withDirectives(h(Exiting), [[vShow, show.value]])),
    }), { attachTo: document.body, global: { stubs: { Transition: false, TransitionGroup: false } } })
    await nextTick()
    show.value = false
    await nextTick()
    expect(onExit).toHaveBeenCalledTimes(1)
    show.value = true
    await nextTick()
    expect(onEnter).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('does nothing outside an AnimatePresence', async () => {
    const { Exiting, onExit } = createExiting()
    const show = ref(true)
    const wrapper = mount(defineComponent({
      setup: () => () => show.value ? h(Exiting) : null,
    }), { attachTo: document.body, global: { stubs: { Transition: false, TransitionGroup: false } } })
    show.value = false
    await nextTick()
    expect(onExit).not.toHaveBeenCalled()
    expect(document.querySelector('.exiting')).toBeNull()
    wrapper.unmount()
  })

  it('stops tracking a component that unmounted without exiting', async () => {
    const { Exiting, onExit } = createExiting()
    const { wrapper } = render(Exiting)
    await nextTick()
    wrapper.unmount()
    expect(onExit).not.toHaveBeenCalled()
  })
})
