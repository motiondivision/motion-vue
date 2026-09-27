import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { defineComponent, nextTick, onMounted, ref } from 'vue'
import type { MotionState } from '@/state/motion-state'
import { Motion } from '@/components'
import { injectMotion } from '@/components/context'

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

/**
 * Regression test for https://github.com/motiondivision/motion-vue/issues/208
 *
 * motion-vue used to call `parent.addChild(visualElement)` at creation time
 * (before mount), so children sat in `parent.enteringChildren` with
 * `current === null`. When a child mounts after its parent (v-if / ClientOnly /
 * async data) and computes its stagger delay, motion-dom sorts
 * `enteringChildren` via `sortNodePosition`, which calls
 * `compareDocumentPosition(other.current)` — throwing in Firefox, whose sort
 * comparator passes the mounted element as `this` and the unmounted sibling as
 * `other` (V8 passes them the other way around, so it never threw there).
 *
 * Registration must instead happen in `visualElement.mount()` (motion-dom
 * already does `parent.addChild(this)` there, after `current` is assigned).
 */
describe('enteringChildren registration (#208)', () => {
  it('never holds unmounted children, and registers every child once mounted', async () => {
    let parentState: MotionState | undefined
    // enteringChildren snapshots taken while sibling children are created
    // but not yet mounted: [unmountedCount, totalCount] per observation
    const snapshots: Array<[number, number]> = []

    const Probe = defineComponent({
      setup() {
        parentState = injectMotion(null) as MotionState
        /**
         * The v-for siblings before this probe have run their MotionState
         * constructors, but Vue flushes mounted hooks only after the whole
         * tree is patched — so this is the exact window where issue #208's
         * stagger sort ran against unmounted children.
         */
        const entering = parentState?.visualElement?.enteringChildren
        const unmounted = entering
          ? [...entering].filter(child => !child.current).length
          : 0
        snapshots.push([unmounted, entering?.size ?? 0])
        return () => null
      },
    })

    const App = defineComponent({
      setup() {
        const show = ref(false)
        // children mount after the parent, like v-if / <ClientOnly> / data arriving
        onMounted(() => {
          show.value = true
        })
        return () => (
          <Motion variants={variants} initial="hidden" animate="visible">
            {show.value
              ? [
                  ...[1, 2, 3, 4, 5].map(i => (
                    <Motion key={i} variants={variants} initial="hidden" animate="visible" />
                  )),
                  <Probe key="probe" />,
                ]
              : []}
          </Motion>
        )
      },
    })

    render(App)
    await nextTick()
    await nextTick()

    // The probe ran while the 5 siblings were created-but-unmounted:
    // none of them may be in enteringChildren yet
    expect(snapshots.length).toBeGreaterThan(0)
    for (const [unmounted] of snapshots) {
      expect(unmounted).toBe(0)
    }

    // Positive control: registration still happens — once mounted, all five
    // children are tracked by the parent's visual element
    expect(parentState?.visualElement?.children.size).toBe(5)
  })
})
