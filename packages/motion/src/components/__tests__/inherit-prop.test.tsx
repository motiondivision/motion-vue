import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { motionValue } from 'framer-motion/dom'
import { defineComponent, nextTick } from 'vue'
import type { MotionState } from '@/state/motion-state'
import { Motion, Reorder } from '@/components'
import { injectMotion } from '@/components/context'

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.000001 } },
}

describe('inherit prop default (#272)', () => {
  it('reads an absent inherit prop as undefined so a variants-only child joins the parent variant tree', async () => {
    let childState: MotionState | undefined

    const Probe = defineComponent({
      setup() {
        childState = injectMotion(null) as MotionState
        return () => null
      },
    })

    const App = defineComponent({
      setup() {
        return () => (
          <Motion variants={variants} initial="hidden" animate="visible">
            <Motion variants={variants}>
              <Probe />
            </Motion>
          </Motion>
        )
      },
    })

    render(App)
    await nextTick()

    expect(childState).toBeDefined()
    expect(childState?.visualElement.props.inherit).toBeUndefined()
    expect(childState?.parent?.visualElement.variantChildren?.size).toBe(1)
  })

  it('reads an absent inherit prop as undefined on Reorder.Group and Reorder.Item', async () => {
    let groupState: MotionState | undefined
    let itemState: MotionState | undefined

    const GroupProbe = defineComponent({
      setup() {
        groupState = injectMotion(null) as MotionState
        return () => null
      },
    })

    const ItemProbe = defineComponent({
      setup() {
        itemState = injectMotion(null) as MotionState
        return () => null
      },
    })

    const App = defineComponent({
      setup() {
        return () => (
          <Motion variants={variants} initial="hidden" animate="visible">
            <Reorder.Group values={[1]}>
              <GroupProbe />
              <Reorder.Item value={1} variants={variants}>
                <ItemProbe />
              </Reorder.Item>
            </Reorder.Group>
          </Motion>
        )
      },
    })

    render(App)
    await nextTick()

    expect(groupState).toBeDefined()
    expect(groupState?.visualElement.props.inherit).toBeUndefined()
    expect(itemState).toBeDefined()
    expect(itemState?.visualElement.props.inherit).toBeUndefined()
    expect(groupState?.parent?.visualElement.variantChildren?.size).toBe(1)
  })

  it('keeps an explicit inherit={false} as false', async () => {
    let childState: MotionState | undefined

    const Probe = defineComponent({
      setup() {
        childState = injectMotion(null) as MotionState
        return () => null
      },
    })

    const App = defineComponent({
      setup() {
        return () => (
          <Motion variants={variants} initial="hidden" animate="visible">
            <Motion variants={variants} inherit={false}>
              <Probe />
            </Motion>
          </Motion>
        )
      },
    })

    render(App)
    await nextTick()

    expect(childState).toBeDefined()
    expect(childState?.visualElement.props.inherit).toBe(false)
  })

  it('animates a variants-only child through the parent labels', async () => {
    const promise = new Promise((resolve) => {
      const opacity = motionValue(0)

      const App = defineComponent({
        setup() {
          return () => (
            <Motion variants={variants} initial="hidden" animate="visible">
              <Motion
                variants={variants}
                style={{ opacity }}
                onAnimationComplete={() => resolve(opacity.get())}
              />
            </Motion>
          )
        },
      })

      render(App)
    })

    await expect(promise).resolves.toBe(1)
  })
})
