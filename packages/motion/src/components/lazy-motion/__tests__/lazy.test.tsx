import { motionValue } from 'framer-motion/dom'
import { describe, expect, it } from 'vitest'
import { m } from '../../motion/m'
import { motion } from '../../motion'
import { render } from '@testing-library/vue'
import { defineComponent } from 'vue'
import { LazyMotion } from '@/components/lazy-motion'
import { domAnimation, domMax } from '@/features'

describe('lazy feature loading', () => {
  it('doesn\'t animate without loaded features', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const onComplete = () => resolve(x.get())
      const Component = defineComponent({
        setup() {
          return () => (
            <m.div
              animate={{ x: 20 }}
              transition={{ duration: 0.01 }}
              style={{ x }}
              onAnimationComplete={onComplete}
            />
          )
        },
      })

      const wrapper = render(Component)
      setTimeout(() => resolve(x.get()), 50)
    })
    return expect(promise).resolves.not.toBe(20)
  })

  it('does animate with synchronously-loaded domAnimation', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const onComplete = () => resolve(x.get())

      const Component = defineComponent({
        setup() {
          return () => (
            <LazyMotion features={domAnimation}>
              <m.div
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
      // setTimeout(() => resolve(x.get()), 50)
    })

    return expect(promise).resolves.toBe(20)
  })

  it('does animate with synchronously-loaded domMax', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const onComplete = () => resolve(x.get())

      const Component = defineComponent({
        setup() {
          return () => (
            <LazyMotion features={domMax}>
              <m.div
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

    return expect(promise).resolves.toBe(20)
  })

  it('supports nested feature sets', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const onComplete = () => resolve(x.get())

      const Component = defineComponent({
        setup() {
          return () => (
            <LazyMotion features={domMax}>
              <m.div
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

    return expect(promise).resolves.toBe(20)
  })

  it('doesn\'t throw without strict mode', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const onComplete = () => resolve(x.get())

      const Component = defineComponent({
        setup() {
          return () => (
            <LazyMotion features={domMax}>
              <m.div
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

    return expect(promise).resolves.toBe(20)
  })

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

  it('animates after async loading', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const onComplete = () => resolve(x.get())

      const Component = defineComponent({
        setup() {
          return () => (
            <LazyMotion features={() => import('@/features/dom-animation').then(mod => mod.domAnimation)}>
              <m.div
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

    return expect(promise).resolves.toBe(20)
  })
})
