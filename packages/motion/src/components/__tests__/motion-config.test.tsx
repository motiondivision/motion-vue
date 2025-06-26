import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
