import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { motionValue } from 'framer-motion/dom'
import { h, nextTick } from 'vue'
import { MotionConfig } from '@/components/motion-config'
import { useAnimate } from '../use-animate'
import { delay } from '@/shared/test'

describe('useAnimate skipAnimations', () => {
  function mountWithConfig(configProps: Record<string, unknown>) {
    let animate: ReturnType<typeof useAnimate>[1]
    const Child = {
      setup() {
        const [, a] = useAnimate()
        animate = a
        return () => h('div')
      },
    }
    mount({
      components: { MotionConfig, Child },
      setup() {
        return { configProps }
      },
      render() {
        return h(MotionConfig, configProps, () => h(Child))
      },
    })
    return () => animate
  }

  it('applies final value instantly when MotionConfig skipAnimations is set', async () => {
    const getAnimate = mountWithConfig({ skipAnimations: true })
    await nextTick()

    const value = motionValue(0)
    getAnimate()(value, 100, { duration: 10 })
    await delay(50)

    expect(value.get()).toBe(100)
  })

  it('animates over time when skipAnimations is not set', async () => {
    const getAnimate = mountWithConfig({})
    await nextTick()

    const value = motionValue(0)
    getAnimate()(value, 100, { duration: 10 })
    await delay(50)

    expect(value.get()).toBeLessThan(100)
  })
})
