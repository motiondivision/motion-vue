/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { AnimatePresence, Motion } from '@/components'
import { mountedStates } from '@/state/motion-state'
import { delay } from '@/shared/test'

function mountToggle(onExitComplete?: () => void) {
  const show = ref(true)
  const Wrapper = defineComponent({
    components: { AnimatePresence, Motion },
    setup: () => ({ show, onExitComplete }),
    template: `
      <AnimatePresence :on-exit-complete="onExitComplete">
        <Motion
          v-show="show"
          data-testid="box"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.05 }"
        >box</Motion>
      </AnimatePresence>
    `,
  })
  const wrapper = mount(Wrapper, {
    attachTo: document.body,
    global: { stubs: { Transition: false } },
  })
  return { show, wrapper }
}

describe('animate-presence v-show', () => {
  it('defers display: none until the exit animation completes', async () => {
    const onExitComplete = vi.fn()
    const { show, wrapper } = mountToggle(onExitComplete)
    await nextTick()
    await delay(100)

    const el = document.querySelector('[data-testid="box"]') as HTMLElement
    expect(el.style.display).not.toBe('none')

    // Hold the exit open: jsdom would settle the animation instantly.
    const state = mountedStates.get(el)! as any
    let resolveExit!: () => void
    vi.spyOn(state.visualElement.animationState, 'setActive')
      .mockReturnValue(new Promise<void>(resolve => (resolveExit = resolve)))

    show.value = false
    await nextTick()
    await delay(20)

    // Still on screen while the exit animation runs.
    expect(el.style.display).not.toBe('none')
    expect(onExitComplete).not.toHaveBeenCalled()

    resolveExit()
    await delay(20)
    await nextTick()

    expect(el.style.display).toBe('none')
    expect(onExitComplete).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('restores visibility and reverses the exit when v-show flips back', async () => {
    const { show, wrapper } = mountToggle()
    await nextTick()
    await delay(100)

    const el = document.querySelector('[data-testid="box"]') as HTMLElement
    const state = mountedStates.get(el)! as any
    const pending: Array<() => void> = []
    vi.spyOn(state.visualElement.animationState, 'setActive')
      .mockReturnValue(new Promise<void>(resolve => pending.push(resolve)))

    show.value = false
    await nextTick()
    await delay(20)
    expect(el.style.display).not.toBe('none')

    show.value = true
    await nextTick()
    await delay(20)
    expect(el.style.display).not.toBe('none')

    // A stale exit settling after re-entry must not hide the element.
    pending.forEach(resolve => resolve())
    await delay(20)
    expect(el.style.display).not.toBe('none')

    wrapper.unmount()
  })

  it('removes the element on v-if after an earlier v-show exit settled', async () => {
    const show = ref(true)
    const visible = ref(true)
    const onExitComplete = vi.fn()
    const wrapper = mount(defineComponent({
      components: { AnimatePresence, Motion },
      setup: () => ({ show, visible, onExitComplete }),
      template: `
        <AnimatePresence :on-exit-complete="onExitComplete">
          <Motion
            v-if="show"
            v-show="visible"
            key="a"
            data-testid="box"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.01 }"
          >box</Motion>
        </AnimatePresence>
      `,
    }), { attachTo: document.body })
    await nextTick()
    await delay(50)

    visible.value = false
    await nextTick()
    await delay(100)
    expect(onExitComplete).toHaveBeenCalledTimes(1)

    show.value = false
    await nextTick()
    await delay(100)
    await nextTick()
    expect(document.querySelector('[data-testid="box"]')).toBeNull()
    expect(onExitComplete).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })
})
