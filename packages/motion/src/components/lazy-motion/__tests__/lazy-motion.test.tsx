import { motionValue } from 'framer-motion/dom'
import { describe, expect, it } from 'vitest'
import { motion } from '../../motion'
import { render } from '@testing-library/vue'
import { defineComponent } from 'vue'
import { LazyMotion } from '@/components/lazy-motion'
import { domMax } from '@/features'

describe('lazy feature loading with motion component', () => {
  it('throws in strict mode', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const onComplete = () => resolve(x.get())

      const Component = defineComponent({
        setup() {
          return () => (
            <LazyMotion features={domMax} strict>
              <motion.div
                animate={{ x: 20 }}
                transition={{ duration: 0.01 }}
                style={{ x }}
                onAnimationComplete={onComplete}
              />
            </LazyMotion>
          )
        },
      })

      const wrapper = render(Component)
    })

    return expect(promise).rejects.toThrowError()
  })
})
