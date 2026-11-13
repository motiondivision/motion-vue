/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { AnimatePresence, Motion } from '@/components'
import { delay } from '@/shared/test'

// jsdom reports offsetParent === null for every element, which makes
// AnimationFeature treat mounted elements as hidden.
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

describe('animatePresence exit races', () => {
  it('keeps an element mounted when it leaves twice before its exit finishes', async () => {
    const onExitComplete = vi.fn()
    const Wrapper = defineComponent({
      components: { AnimatePresence, Motion },
      setup() {
        const shown = ref(true)
        const items = ref([0])
        return { shown, items, onExitComplete }
      },
      template: `
        <AnimatePresence :on-exit-complete="onExitComplete">
          <Motion
            v-for="item in items"
            :key="item"
            v-show="shown"
            class="item"
            :initial="{ opacity: 1 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.3 }"
          />
        </AnimatePresence>
      `,
    })
    const wrapper = mount(Wrapper, {
      attachTo: document.body,
      global: globalStubs,
    })
    await nextTick()
    await delay(50)

    const el = wrapper.find('.item').element as HTMLElement
    expect(el.isConnected).toBe(true)

    wrapper.vm.shown = false
    await nextTick()

    wrapper.vm.items = []
    await nextTick()
    await delay(50)

    expect(el.isConnected).toBe(true)
    expect(onExitComplete).not.toHaveBeenCalled()

    await delay(400)
    expect(el.isConnected).toBe(false)
    expect(onExitComplete).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('fires onExitComplete once when sibling motion children leave together', async () => {
    const onExitComplete = vi.fn()
    const Wrapper = defineComponent({
      components: { AnimatePresence, Motion },
      setup() {
        const show = ref(true)
        return { show, onExitComplete }
      },
      template: `
        <AnimatePresence :on-exit-complete="onExitComplete">
          <Motion v-if="show" key="a" class="a" :initial="{ opacity: 1 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0 }" :transition="{ duration: 0.05 }" />
          <Motion v-if="show" key="b" class="b" :initial="{ opacity: 1 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0 }" :transition="{ duration: 0.05 }" />
        </AnimatePresence>
      `,
    })
    const wrapper = mount(Wrapper, {
      attachTo: document.body,
      global: globalStubs,
    })
    await nextTick()
    await delay(20)

    wrapper.vm.show = false
    await nextTick()
    await delay(200)

    expect(document.querySelector('.a')).toBeNull()
    expect(document.querySelector('.b')).toBeNull()
    expect(onExitComplete).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('waits for the motion sibling before firing onExitComplete in a mixed batch', async () => {
    const onExitComplete = vi.fn()
    const Wrapper = defineComponent({
      components: { AnimatePresence, Motion },
      setup() {
        const show = ref(true)
        return { show, onExitComplete }
      },
      template: `
        <AnimatePresence :on-exit-complete="onExitComplete">
          <Motion v-if="show" key="a" class="a" :initial="{ opacity: 1 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0 }" :transition="{ duration: 0.2 }" />
          <div v-if="show" key="b" class="plain">plain</div>
        </AnimatePresence>
      `,
    })
    const wrapper = mount(Wrapper, {
      attachTo: document.body,
      global: globalStubs,
    })
    await nextTick()
    await delay(20)

    wrapper.vm.show = false
    await nextTick()
    await delay(50)

    expect(document.querySelector('.plain')).toBeNull()
    expect(onExitComplete).not.toHaveBeenCalled()

    await delay(300)
    expect(document.querySelector('.a')).toBeNull()
    expect(onExitComplete).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })
})
