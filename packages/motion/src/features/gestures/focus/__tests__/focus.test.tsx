import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { motion } from '@/components'
import { defineComponent, nextTick, ref } from 'vue'
import { frame, motionValue } from 'framer-motion/dom'
import { delay } from '@/shared/test'

describe('focus Gesture', () => {
  it('focus applied', async () => {
    const promise = new Promise(async (resolve) => {
      const opacity = motionValue(1)
      const { getByTestId } = render(defineComponent({
        setup() {
          return () => (
            <motion.a
              data-testid="myAnchorElement"
              href="#"
              focus={{ opacity: 0.1 }}
              transition={{ duration: 0 }}
              style={{ opacity }}
            >
            </motion.a>
          )
        },
      }))
      await nextTick()
      const element = getByTestId('myAnchorElement') as HTMLElement
      element.matches = () => true
      element.focus()
      await delay(0)
      resolve(opacity.get())
    })

    return expect(promise).resolves.toBe(0.1)
  })

  it('whileFocus not applied when :focus-visible is false', async () => {
    const promise = new Promise(async (resolve) => {
      const opacity = motionValue(1)
      const { getByTestId } = render(defineComponent({
        setup() {
          return () => (
            <motion.a
              data-testid="myAnchorElement"
              href="#"
              focus={{ opacity: 0.1 }}
              transition={{ duration: 0 }}
              style={{ opacity }}
            >
            </motion.a>
          )
        },
      }))
      await nextTick()
      const element = getByTestId('myAnchorElement') as HTMLElement
      element.matches = () => false
      element.focus()
      await delay(0)
      resolve(opacity.get())
    })

    return expect(promise).resolves.toBe(1)
  })

  it('focus applied if focus-visible selector throws unsupported', async () => {
    const promise = new Promise(async (resolve) => {
      const opacity = motionValue(1)
      const { getByTestId } = render(defineComponent({
        setup() {
          return () => (
            <motion.a
              data-testid="myAnchorElement"
              href="#"
              focus={{ opacity: 0.1 }}
              transition={{ duration: 0 }}
              style={{ opacity }}
            >
            </motion.a>
          )
        },
      }))
      await nextTick()
      const element = getByTestId('myAnchorElement') as HTMLElement
      element.matches = () => {
        /**
         * Explicitly throw as while Jest throws we want to ensure this
         * behaviour isn't silently fixed should it fix this in the future.
         */
        throw new Error('this selector not supported')
      }
      element.focus()
      await delay(0)
      resolve(opacity.get())
    })

    return expect(promise).resolves.toBe(0.1)
  })

  it('whileFocus applied as variant', async () => {
    const target = 0.5
    const promise = new Promise(async (resolve) => {
      const variant = {
        hidden: { opacity: target },
      }
      const opacity = motionValue(1)
      const { getByTestId } = render(defineComponent({
        setup() {
          const Aref = ref<HTMLAnchorElement>()
          return () => (
            <motion.a
              ref={Aref}
              data-testid="myAnchorElement"
              href="#"
              focus="hidden"
              variants={variant}
              transition={{ type: false }}
              style={{ opacity }}
            >
            </motion.a>
          )
        },
      }))
      await nextTick()
      const element = getByTestId('myAnchorElement') as HTMLElement
      element.matches = () => true
      element.focus()
      await delay(0)
      resolve(opacity.get())
    })

    return expect(promise).resolves.toBe(target)
  })
})
