import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { motionValue } from 'framer-motion/dom'
import { defineComponent, nextTick, onMounted } from 'vue'
import MotionConfig from '@/components/motion-config/MotionConfig.vue'
import { Motion } from '@/components/motion'
import { useAnimate } from '@/animation'

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
  it('applies final useAnimate value instantly without tracking an animation', async () => {
    let getScopeAnimations = () => 0
    const Child = defineComponent({
      setup() {
        const [scope, animate] = useAnimate<HTMLDivElement>()
        getScopeAnimations = () => scope.animations.length

        onMounted(() => {
          animate(scope.value, { opacity: 0.5 }, { duration: 10 })
        })

        return () => <div ref={scope} style={{ opacity: 1 }} />
      },
    })

    const wrapper = mount(defineComponent({
      setup() {
        return () => (
          <MotionConfig skipAnimations>
            <Child />
          </MotionConfig>
        )
      },
    }))

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('div').element.style.opacity).toBe('0.5')
    expect(getScopeAnimations()).toBe(0)
  })
})
