import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Motion from '../Motion.vue'
import { motionValue } from 'framer-motion/dom'

function createRerender(Component: any) {
  let wrapper: any = null

  const render = (props = {}) => {
    if (wrapper) {
      wrapper.unmount()
    }
    wrapper = mount(Component, { props })
    return { wrapper }
  }

  const rerender = (newProps = {}) => {
    return render(newProps)
  }

  return {
    ...render(),
    rerender,
  }
}

describe('animate prop as object', () => {
  it('animates to set prop', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const onComplete = () => resolve(x.get())
      mount(Motion, {
        props: {
          animate: { x: 20 },
          style: { x },
          onMotioncomplete: onComplete,
        },
      })
    })
    await expect(promise).resolves.toBe(20)
  })

  it('accepts custom transition prop', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const onUpdate = () => resolve(x.get())
      mount(Motion, {
        props: {
          animate: { x: 20 },
          transition: {
            x: { type: 'tween', from: 10, ease: () => 0.5 },
          },
          style: { x },
          onUpdate,
        },
      })
    })
    await expect(promise).resolves.toBe(15)
  })

  it('fires onMotionstart when animation begins', async () => {
    const promise = new Promise((resolve) => {
      const onStart = vi.fn()
      const onComplete = () => resolve(onStart)

      const { wrapper, rerender } = createRerender(Motion)

      rerender({
        animate: { x: 20 },
        transition: { type: false },
        onMotionstart: onStart,
        onMotioncomplete: onComplete,
      })

      wrapper.unmount()
    })

    await expect(promise).resolves.toHaveBeenCalledTimes(1)
  })

  it('uses transition on subsequent renders', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const { rerender } = createRerender(Motion)
      rerender({
        style: { x },
        animate: { x: 10, transition: { type: false } },
      })
      rerender({
        style: { x },
        animate: { x: 20, transition: { type: false } },
      })
      rerender({
        style: { x },
        animate: { x: 30, transition: { type: false } },
      })
      requestAnimationFrame(() => resolve(x.get()))
    })
    await expect(promise).resolves.toBe(30)
  })

  it('transition accepts manual from value', async () => {
    const promise = new Promise((resolve) => {
      const output: number[] = []
      mount(Motion, {
        props: {
          animate: { x: 50 },
          transition: { from: 0, ease: 'linear' },
          onUpdate: (v: { x: number }) => output.push(v.x),
          onMotioncomplete: () => resolve(output.every(v => v <= 50)),
        },
      })
    })
    await expect(promise).resolves.toBe(true)
  })

  it('uses transitionEnd on subsequent renders', async () => {
    const promise = new Promise((resolve) => {
      const x = motionValue(0)
      const { rerender } = createRerender(Motion)
      rerender({
        style: { x },
        animate: {
          x: 10,
          transition: { type: false },
          transitionEnd: { x: 100 },
        },
      })
      rerender({
        style: { x },
        animate: {
          x: 20,
          transition: { type: false },
          transitionEnd: { x: 200 },
        },
      })
      rerender({
        style: { x },
        animate: {
          x: 30,
          transition: { type: false },
          transitionEnd: { x: 300 },
        },
      })
      requestAnimationFrame(() => resolve(x.get()))
    })
    await expect(promise).resolves.toBe(300)
  })
})
