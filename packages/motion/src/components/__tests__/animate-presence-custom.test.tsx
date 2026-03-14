/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { AnimatePresence, Motion } from '@/components'
import { delay } from '@/shared/test'

const globalStubs = {
  stubs: {
    Transition: false,
    TransitionGroup: false,
  },
}

describe('animatePresence custom prop with v-if', () => {
  it('exit variant function receives custom value', async () => {
    const exitCalls: any[] = []

    const Wrapper = defineComponent({
      components: { AnimatePresence, Motion },
      setup() {
        const show = ref(true)
        const variants = {
          visible: { opacity: 1 },
          hidden: (custom: any) => {
            exitCalls.push(custom)
            return { opacity: 0 }
          },
        }
        return { show, variants }
      },
      template: `
        <AnimatePresence :custom="42">
          <div v-if="show" key="item">
            <Motion
              initial="hidden"
              animate="visible"
              exit="hidden"
              :variants="variants"
              :transition="{ duration: 0.05 }"
            />
          </div>
        </AnimatePresence>
      `,
    })

    const wrapper = mount(Wrapper, {
      attachTo: document.body,
      global: globalStubs,
    })
    await nextTick()
    await delay(50)
    exitCalls.length = 0

    wrapper.vm.show = false
    await nextTick()
    await delay(100)

    expect(exitCalls.length).toBeGreaterThan(0)
    expect(exitCalls[0]).toBe(42)

    wrapper.unmount()
  })

  it('exit variant receives updated custom when changed before v-if toggle', async () => {
    const exitCalls: any[] = []

    const Wrapper = defineComponent({
      components: { AnimatePresence, Motion },
      setup() {
        const show = ref(true)
        const custom = ref(1)
        const variants = {
          visible: { opacity: 1 },
          hidden: (c: any) => {
            exitCalls.push(c)
            return { opacity: 0 }
          },
        }
        return { show, custom, variants }
      },
      template: `
        <AnimatePresence :custom="custom">
          <div v-if="show" key="item">
            <Motion
              initial="hidden"
              animate="visible"
              exit="hidden"
              :variants="variants"
              :transition="{ duration: 0.05 }"
            />
          </div>
        </AnimatePresence>
      `,
    })

    const wrapper = mount(Wrapper, {
      attachTo: document.body,
      global: globalStubs,
    })
    await nextTick()
    await delay(50)
    exitCalls.length = 0

    wrapper.vm.custom = -1
    await nextTick()

    wrapper.vm.show = false
    await nextTick()
    await delay(100)

    expect(exitCalls.length).toBeGreaterThan(0)
    expect(exitCalls[0]).toBe(-1)

    wrapper.unmount()
  })
})
