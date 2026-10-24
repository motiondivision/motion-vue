/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { AnimatePresence } from '@/components'
import { vMotion } from '@/directive'
import { mountedStates } from '@/state/motion-state'
import { delay } from '@/shared/test'

/**
 * The v-motion directive must honour the same AnimatePresence exit protocol as
 * a motion component: the element stays mounted while its exit animation runs
 * and is only removed once the exit settles.
 *
 * The directive resolves its presence context from the vnode tree, and that
 * lookup can fail mid-exit (the exiting vnode is replayed by reference, so the
 * tree walk no longer finds it). ExitFeature therefore reports completion to
 * the context it registered with at mount, not to whatever the current options
 * happen to hold — these tests pin that contract.
 */
function mountDirectivePresence(template: string, setup: () => Record<string, any>) {
  return mount(defineComponent({
    components: { AnimatePresence },
    directives: { motion: vMotion },
    setup,
    template,
  }), {
    attachTo: document.body,
    global: { stubs: { Transition: false } },
  })
}

describe('v-motion inside AnimatePresence', () => {
  it('keeps the element mounted during exit, removes it once the exit settles', async () => {
    const wrapper = mountDirectivePresence(
      `<AnimatePresence>
        <div v-if="show" v-motion="{ animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.05 } }" data-testid="box" />
      </AnimatePresence>`,
      () => ({ show: ref(true) }),
    )
    await nextTick()
    await delay(50)
    const el = wrapper.find('[data-testid="box"]').element as HTMLElement
    const state = mountedStates.get(el)
    expect(state).toBeTruthy()

    wrapper.vm.show = false
    await nextTick()
    await delay(20)

    // Mid-exit: still in the DOM, exit animation in flight.
    expect(wrapper.find('[data-testid="box"]').exists()).toBe(true)
    expect(el.isConnected).toBe(true)
    expect(state!.isExiting).toBe(true)

    await delay(200)
    expect(wrapper.find('[data-testid="box"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('fires exitComplete only after the exit animation finishes', async () => {
    const wrapper = mountDirectivePresence(
      `<AnimatePresence @exit-complete="complete++">
        <div v-if="show" v-motion="{ animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.05 } }" data-testid="box" />
      </AnimatePresence>`,
      () => ({ show: ref(true), complete: ref(0) }),
    )
    await nextTick()
    await delay(50)

    wrapper.vm.show = false
    await nextTick()
    await delay(20)
    // The exit is still running, so the container has not completed yet.
    expect(wrapper.vm.complete).toBe(0)

    await delay(200)
    expect(wrapper.vm.complete).toBe(1)
    expect(wrapper.find('[data-testid="box"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('defers v-show display:none until the exit settles', async () => {
    const wrapper = mountDirectivePresence(
      `<AnimatePresence>
        <div v-show="show" v-motion="{ animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.05 } }" data-testid="box" />
      </AnimatePresence>`,
      () => ({ show: ref(true) }),
    )
    await nextTick()
    await delay(50)
    const el = wrapper.find('[data-testid="box"]').element as HTMLElement

    wrapper.vm.show = false
    await nextTick()
    await delay(20)

    // Mid-exit: v-show must not hide the element while the exit runs.
    expect(el.style.display).not.toBe('none')

    await delay(200)
    expect(el.style.display).toBe('none')
    // v-show never unmounts.
    expect(wrapper.find('[data-testid="box"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('re-showing mid-exit reverses the exit instead of replaying it', async () => {
    const wrapper = mountDirectivePresence(
      `<AnimatePresence>
        <div v-show="show" v-motion="{ animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.05 } }" data-testid="box" />
      </AnimatePresence>`,
      () => ({ show: ref(true) }),
    )
    await nextTick()
    await delay(50)
    const el = wrapper.find('[data-testid="box"]').element as HTMLElement
    const state = mountedStates.get(el)!

    wrapper.vm.show = false
    await nextTick()
    await delay(20)
    expect(state.isExiting).toBe(true)

    // Flip back before the exit settles: the exit is cancelled and the
    // element returns to its animate state without ever hiding.
    wrapper.vm.show = true
    await nextTick()
    await delay(200)
    expect(state.isExiting).toBe(false)
    expect(el.style.display).not.toBe('none')
    expect(Number(el.style.opacity)).toBe(1)
    wrapper.unmount()
  })
})
