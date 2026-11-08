import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { motionValue } from 'framer-motion/dom'
import { defineComponent, nextTick } from 'vue'
import MotionConfig from '@/components/motion-config/MotionConfig.vue'
import { Motion } from '@/components/motion'

describe('reducedMotion', () => {
  it('reducedMotion always', async () => {
    const scale = motionValue(1)
    const wrapper = mount(defineComponent({
      setup() {
        return () => (
          <MotionConfig reducedMotion="always">
            <Motion animate={{ scale: 0.5 }} style={{ scale }} />
          </MotionConfig>
        )
      },
    }))
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(scale.get()).toBe(0.5)
  })
})

describe('skipAnimations', () => {
  it('applies animate values instantly and completes the animation', async () => {
    const x = motionValue(0)
    const opacity = motionValue(0)
    const onAnimationComplete = vi.fn()
    mount(defineComponent({
      setup() {
        return () => (
          <MotionConfig skipAnimations>
            <Motion
              animate={{ x: 100, opacity: 1 }}
              transition={{ duration: 10 }}
              style={{ x, opacity }}
              onAnimationComplete={onAnimationComplete}
            />
          </MotionConfig>
        )
      },
    }))
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(x.get()).toBe(100)
    expect(opacity.get()).toBe(1)
    expect(onAnimationComplete).toHaveBeenCalledTimes(1)
  })

  it('starts an element at its animate values, and still completes its animation', async () => {
    const onAnimationComplete = vi.fn()
    const wrapper = mount(defineComponent({
      setup() {
        return () => (
          <MotionConfig skipAnimations>
            <Motion
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 10 }}
              onAnimationComplete={onAnimationComplete}
            />
          </MotionConfig>
        )
      },
    }))
    // As mounted, before a frame has applied the skipped animation's values
    const { style } = wrapper.find('div').element as HTMLElement
    expect(style.opacity).toBe('1')
    expect(style.transform).toBe('none')
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(onAnimationComplete).toHaveBeenCalledTimes(1)
  })

  it('starts a variant child at the variant its parent animates to', () => {
    const variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    const wrapper = mount(defineComponent({
      setup() {
        return () => (
          <MotionConfig skipAnimations>
            <Motion initial="hidden" animate="visible" variants={variants}>
              <Motion data-testid="child" variants={variants} />
            </Motion>
          </MotionConfig>
        )
      },
    }))
    const { style } = wrapper.find('[data-testid="child"]').element as HTMLElement
    expect(style.opacity).toBe('1')
  })

  it('is inherited through a nested MotionConfig that does not set it', async () => {
    const x = motionValue(0)
    mount(defineComponent({
      setup() {
        return () => (
          <MotionConfig skipAnimations>
            <MotionConfig transition={{ duration: 10 }}>
              <Motion animate={{ x: 100 }} style={{ x }} />
            </MotionConfig>
          </MotionConfig>
        )
      },
    }))
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(x.get()).toBe(100)
  })
})
