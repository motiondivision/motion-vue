/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref, shallowRef } from 'vue'
import { AnimatePresence, Motion } from '@/components'
import { MotionState, mountedStates } from '@/state/motion-state'
import { ExitFeature } from '@/features/exit/exit'
import type { Options } from '@/types'
import { delay } from '@/shared/test'

// jsdom reports offsetParent === null for every element, which makes
// AnimationFeature treat mounted elements as hidden and apply exit values.
// Emulate the browser: connected elements have an offsetParent.
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  configurable: true,
  get(this: HTMLElement) {
    return this.isConnected ? document.body : null
  },
})

const globalStubs = {
  stubs: {
    Transition: false,
    TransitionGroup: false,
  },
}

function makePanel(name: string) {
  return defineComponent({
    name,
    components: { AnimatePresence, Motion },
    template: `
      <AnimatePresence>
        <Motion
          class="panel"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.05 }"
        >${name}</Motion>
      </AnimatePresence>
    `,
  })
}

function mountKeepAlive() {
  const PanelA = makePanel('PanelA')
  const PanelB = makePanel('PanelB')
  const Wrapper = defineComponent({
    components: { PanelA, PanelB },
    setup() {
      const current = shallowRef(PanelA)
      return { current }
    },
    template: `<KeepAlive><component :is="current" /></KeepAlive>`,
  })
  const wrapper = mount(Wrapper, { attachTo: document.body, global: globalStubs })
  return { wrapper, PanelA, PanelB }
}

describe('keepAlive presence', () => {
  it('plays the exit animation in place before the element is moved to the storage container', async () => {
    const { wrapper, PanelB } = mountKeepAlive()
    await nextTick()
    await delay(100)

    const elA = wrapper.find('.panel').element as HTMLElement
    expect(elA.style.opacity).toBe('1')

    wrapper.vm.current = PanelB
    await nextTick()

    // Exit still running: the leaving element has not been detached yet
    expect(elA.isConnected).toBe(true)

    await delay(200)
    // Exit completed: KeepAlive has moved it into the detached storage container
    expect(elA.isConnected).toBe(false)

    wrapper.unmount()
  })

  it('reactivation remounts the state and replays initial → animate', async () => {
    const { wrapper, PanelA, PanelB } = mountKeepAlive()
    await nextTick()
    await delay(100)

    const elA = wrapper.find('.panel').element as HTMLElement
    const state = mountedStates.get(elA)!

    wrapper.vm.current = PanelB
    await nextTick()
    await delay(200)
    expect(elA.isConnected).toBe(false)
    expect(state.isMounted()).toBe(false)

    // Reactivate A — the stale-exit bug left the state unmounted forever
    wrapper.vm.current = PanelA
    await nextTick()
    await delay(200)

    expect(elA.isConnected).toBe(true)
    expect(state.isMounted()).toBe(true)
    expect(elA.style.opacity).toBe('1')

    wrapper.unmount()
  })

  it('re-registered states still intercept the exit on subsequent switches', async () => {
    const { wrapper, PanelA, PanelB } = mountKeepAlive()
    await nextTick()
    await delay(100)

    const elA = wrapper.find('.panel').element as HTMLElement

    for (let i = 0; i < 3; i++) {
      wrapper.vm.current = PanelB
      await nextTick()
      await delay(200)
      wrapper.vm.current = PanelA
      await nextTick()
      await delay(200)
    }

    expect(elA.isConnected).toBe(true)
    expect(elA.style.opacity).toBe('1')

    // Fourth switch away: the exit session must still hold the element in
    // place mid-exit — proof the remount re-registered with AnimatePresence
    wrapper.vm.current = PanelB
    await nextTick()
    expect(elA.isConnected).toBe(true)
    await delay(200)
    expect(elA.isConnected).toBe(false)

    wrapper.unmount()
  })

  it('bare motion component without AnimatePresence remounts cleanly on reactivation', async () => {
    const Bare = defineComponent({
      name: 'Bare',
      components: { Motion },
      template: `
        <Motion
          class="bare"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ duration: 0.05 }"
        >Bare</Motion>
      `,
    })
    const Other = defineComponent({ name: 'Other', template: `<div class="other">Other</div>` })
    const Wrapper = defineComponent({
      components: { Bare, Other },
      setup() {
        const current = shallowRef(Bare)
        return { current }
      },
      template: `<KeepAlive><component :is="current" /></KeepAlive>`,
    })
    const wrapper = mount(Wrapper, { attachTo: document.body, global: globalStubs })
    await nextTick()
    await delay(100)

    const el = wrapper.find('.bare').element as HTMLElement
    const state = mountedStates.get(el)!
    expect(el.style.opacity).toBe('1')

    wrapper.vm.current = Other
    await nextTick()
    await delay(100)
    expect(el.isConnected).toBe(false)
    // The deactivated hook must drive the state unmount — no AnimatePresence
    // exit session exists to do it here
    expect(state.isMounted()).toBe(false)

    wrapper.vm.current = Bare
    await nextTick()
    await delay(200)
    expect(el.isConnected).toBe(true)
    expect(state.isMounted()).toBe(true)
    expect(el.style.opacity).toBe('1')

    wrapper.unmount()
  })

  it('real unmount (no KeepAlive) still unmounts the state', async () => {
    const Wrapper = defineComponent({
      components: { Motion },
      setup: () => ({ show: ref(true) }),
      template: `<Motion v-if="show" class="plain" :animate="{ opacity: 1 }" />`,
    })
    const wrapper = mount(Wrapper, { attachTo: document.body, global: globalStubs })
    await nextTick()

    const el = wrapper.find('.plain').element as HTMLElement
    const state = mountedStates.get(el)!
    expect(state.isMounted()).toBe(true)

    wrapper.vm.show = false
    await nextTick()

    expect(state.isMounted()).toBe(false)
    expect(mountedStates.get(el)).toBeUndefined()

    wrapper.unmount()
  })
})

describe('motionState unmount idempotency', () => {
  it('unmount clears the element so isMounted stays truthful for KeepAlive remounts', () => {
    const state = new MotionState({ as: 'div' } as Options)
    const unmount = vi.fn()
    state.visualElement = { unmount, mount: vi.fn(), latestValues: {} } as any
    state.setBundle({ features: [ExitFeature] })

    const el = document.createElement('div')
    state.mount(el)
    expect(state.isMounted()).toBe(true)

    state.unmount()
    expect(state.isMounted()).toBe(false)
    expect(mountedStates.get(el)).toBeUndefined()

    // A second unmount (exit-session finalize after the deactivated hook)
    // must not resurrect or corrupt the state
    state.unmount()
    expect(state.isMounted()).toBe(false)

    state.mount(el)
    expect(state.isMounted()).toBe(true)
  })
})
