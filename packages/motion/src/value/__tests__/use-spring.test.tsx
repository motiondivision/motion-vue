import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { motionValue } from 'framer-motion/dom'
import { useSpring } from '@/value/use-spring'
import { delay } from '@/shared/test'

describe('useSpring', () => {
  it('fires animationComplete on the returned motionValue when source changes', async () => {
    const onComplete = vi.fn()

    const Component = defineComponent({
      setup() {
        const source = motionValue(0)
        const springValue = useSpring(source, {
          stiffness: 500,
          damping: 20,
          restDelta: 0.001,
          restSpeed: 0.01,
        })

        springValue.on('animationComplete', onComplete)
        source.set(100)
      },
      render() {
        return <div />
      },
    })

    const wrapper = mount(Component)

    // Wait for spring animation to settle
    await delay(3000)

    expect(onComplete).toHaveBeenCalled()
  })
})
