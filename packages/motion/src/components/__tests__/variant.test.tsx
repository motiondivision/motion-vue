import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Motion } from '@/components'
import { motionValue } from 'framer-motion/dom'
import { h, nextTick } from 'vue'
import { delay } from '@/shared/test'

describe('animate prop as variant', () => {
  it('when: beforeChildren works correctly', async () => {
    const promise = new Promise((resolve) => {
      const opacity = motionValue(0.1)
      const variants = {
        visible: {
          opacity: 1,
          transition: { duration: 1, when: 'beforeChildren' },
        },
        hidden: {
          opacity: 0.1,
        },
      }

      // Mount parent Motion with child structure
      mount({
        render() {
          return h(Motion, {
            variants,
            initial: 'hidden',
            animate: 'visible',
          }, {
            default: () => [
              h(Motion, null, {
                default: () => [
                  h(Motion, { variants, style: { opacity } }),
                ],
              }),
            ],
          })
        },
        components: { Motion },
      })

      setTimeout(() => resolve(opacity.get()), 200)
    })

    await expect(promise).resolves.toBe(0.1)
  })
})
