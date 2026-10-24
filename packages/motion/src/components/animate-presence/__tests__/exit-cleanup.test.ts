/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { AnimatePresence, Motion } from '@/components'
import { vMotion } from '@/directive'
import { mountedStates } from '@/state/motion-state'
import { delay } from '@/shared/test'

/**
 * State cleanup once an exit animation settles.
 *
 * v-if removes the child, so its MotionState must unmount with it: the
 * mountedStates entry is dropped and isMounted() flips false. v-show keeps
 * the element mounted, so the state — and its presence registration — must
 * survive the exit, otherwise a later hide would finish instantly instead of
 * running the exit animation. Both are pinned for the Motion component and
 * the v-motion directive.
 *
 * The shared motionStates set (popLayout snapshots) is covered by a leak
 * check: a state whose element was removed must not receive getSnapshot
 * from a later sibling exit.
 */

const exitMotionProps = `:animate="{ opacity: 1 }" :exit="{ opacity: 0 }" :transition="{ duration: 0.05 }"`

function mountIf(asDirective: boolean) {
  const show = ref(true)
  const wrapper = mount(defineComponent({
    components: { AnimatePresence, Motion },
    directives: { motion: vMotion },
    setup: () => ({ show }),
    template: asDirective
      ? `<AnimatePresence><div v-if="show" v-motion ${exitMotionProps} data-testid="box" /></AnimatePresence>`
      : `<AnimatePresence><Motion v-if="show" ${exitMotionProps} data-testid="box" /></AnimatePresence>`,
  }), {
    attachTo: document.body,
    global: { stubs: { Transition: false } },
  })
  return { show, wrapper }
}

function mountShow(asDirective: boolean) {
  const show = ref(true)
  const wrapper = mount(defineComponent({
    components: { AnimatePresence, Motion },
    directives: { motion: vMotion },
    setup: () => ({ show }),
    template: asDirective
      ? `<AnimatePresence><div v-show="show" v-motion ${exitMotionProps} data-testid="box" /></AnimatePresence>`
      : `<AnimatePresence><Motion v-show="show" ${exitMotionProps} data-testid="box" /></AnimatePresence>`,
  }), {
    attachTo: document.body,
    global: { stubs: { Transition: false } },
  })
  return { show, wrapper }
}

describe('exit cleanup', () => {
  for (const asDirective of [false, true]) {
    const via = asDirective ? 'v-motion directive' : 'Motion component'

    it(`v-if (${via}): the motion state unmounts once the exit settles`, async () => {
      const { show, wrapper } = mountIf(asDirective)
      await nextTick()
      await delay(50)
      const el = wrapper.find('[data-testid="box"]').element as HTMLElement
      const state = mountedStates.get(el)!
      expect(state.isMounted()).toBe(true)

      show.value = false
      await nextTick()
      await delay(200)

      expect(wrapper.find('[data-testid="box"]').exists()).toBe(false)
      expect(mountedStates.get(el)).toBeUndefined()
      expect(state.isMounted()).toBe(false)
      wrapper.unmount()
    })

    it(`v-show (${via}): the state and its presence registration survive the exit`, async () => {
      const { show, wrapper } = mountShow(asDirective)
      await nextTick()
      await delay(50)
      const el = wrapper.find('[data-testid="box"]').element as HTMLElement
      const state = mountedStates.get(el)!

      show.value = false
      await nextTick()
      await delay(200)

      // The exit settled (display: none) but nothing may unmount.
      expect(el.style.display).toBe('none')
      expect(state.isMounted()).toBe(true)
      expect(mountedStates.get(el)).toBe(state)

      // Flip back: the element returns to its animate state.
      show.value = true
      await nextTick()
      await delay(200)
      expect(el.style.display).not.toBe('none')
      expect(Number(el.style.opacity)).toBe(1)

      // Hide again, holding the exit animation open. If the first exit had
      // dropped the state's presence registration, PresenceChild would finish
      // instantly; instead it still waits for this state's exit to settle.
      const pending: Array<() => void> = []
      vi.spyOn(state.visualElement.animationState!, 'setActive')
        .mockReturnValue(new Promise<void>(resolve => pending.push(resolve)))
      show.value = false
      await nextTick()
      await delay(20)
      expect(el.style.display).not.toBe('none')

      pending.forEach(resolve => resolve())
      await delay(50)
      await nextTick()
      expect(el.style.display).toBe('none')
      wrapper.unmount()
    })

    it(`popLayout (${via}): a removed child's state is not snapshotted by a later sibling exit`, async () => {
      const items = ref(['a', 'b'])
      const wrapper = mount(defineComponent({
        components: { AnimatePresence, Motion },
        directives: { motion: vMotion },
        setup: () => ({ items }),
        template: asDirective
          ? `<AnimatePresence mode="popLayout">
              <div v-for="item in items" :key="item" v-motion :layout="true" :exit="{ opacity: 0 }" :transition="{ duration: 0.05 }" :data-testid="item" />
            </AnimatePresence>`
          : `<AnimatePresence mode="popLayout">
              <Motion v-for="item in items" :key="item" :layout="true" :exit="{ opacity: 0 }" :transition="{ duration: 0.05 }" :data-testid="item" />
            </AnimatePresence>`,
      }), {
        attachTo: document.body,
        global: { stubs: { Transition: false } },
      })
      await nextTick()
      await delay(50)

      const elA = wrapper.find('[data-testid="a"]').element as HTMLElement
      const stateA = mountedStates.get(elA)!
      const elB = wrapper.find('[data-testid="b"]').element as HTMLElement
      const stateB = mountedStates.get(elB)!

      // Remove A: its exit runs, settles, and the state unmounts. The pop
      // must snapshot the surviving sibling B before the reflow — this is
      // what proves the snapshot loop below actually runs.
      const getSnapshotB = vi.spyOn(stateB, 'getSnapshot')
      items.value = ['b']
      await nextTick()
      await delay(200)
      expect(getSnapshotB).toHaveBeenCalledWith(true)
      expect(mountedStates.get(elA)).toBeUndefined()

      // B's exit must not snapshot A's dead state — unregister during
      // unmount is what keeps the shared set clean.
      const getSnapshotA = vi.spyOn(stateA, 'getSnapshot')
      items.value = []
      await nextTick()
      await delay(200)
      expect(getSnapshotA).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  }
})
