import { describe, expect, it } from 'vitest'
import { createApp, defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { MotionPlugin, createMotionDirective, vMotion } from '@/directive'
import { domAnimation } from '@/features/dom-animation'
import { delay } from '@/shared/test'

describe('v-motion directive', () => {
  it('applies initial styles to element', async () => {
    const wrapper = mount(defineComponent({
      directives: { motion: vMotion },
      template: `<div v-motion="{ initial: { opacity: 0.5, y: 20 } }" data-testid="box" />`,
    }))
    await nextTick()
    const el = wrapper.find('[data-testid="box"]').element as HTMLElement
    expect(el.style.opacity).toBe('0.5')
    expect(el.style.transform).toContain('translateY(20px)')
  })

  it('animates from initial to animate', async () => {
    const wrapper = mount(defineComponent({
      directives: { motion: vMotion },
      template: `<div v-motion="{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.05 } }" data-testid="box" />`,
    }))
    await nextTick()
    const el = wrapper.find('[data-testid="box"]').element as HTMLElement
    // Initially should be 0
    expect(el.style.opacity).toBe('0')
    // After animation completes
    await delay(200)
    expect(Number(el.style.opacity)).toBe(1)
  })

  it('updates state when binding value changes', async () => {
    const wrapper = mount(defineComponent({
      directives: { motion: vMotion },
      setup() {
        const x = ref(0)
        return { x }
      },
      template: `<div v-motion="{ animate: { x }, transition: { duration: 0.05 } }" data-testid="box" />`,
    }))
    await nextTick()
    const el = wrapper.find('[data-testid="box"]').element as HTMLElement
    // Change reactive value
    wrapper.vm.x = 100
    await nextTick()
    await delay(200)
    expect(el.style.transform).toContain('translateX(100px)')
  })

  it('cleans up on unmount', async () => {
    const wrapper = mount(defineComponent({
      directives: { motion: vMotion },
      setup() {
        const show = ref(true)
        return { show }
      },
      template: `<div v-if="show" v-motion="{ initial: { opacity: 1 } }" data-testid="box" />`,
    }))
    await nextTick()
    expect(wrapper.find('[data-testid="box"]').exists()).toBe(true)
    // Should unmount without errors
    wrapper.vm.show = false
    await nextTick()
    expect(wrapper.find('[data-testid="box"]').exists()).toBe(false)
  })

  it('works with createMotionDirective using domAnimation bundle', async () => {
    const directive = createMotionDirective(domAnimation)
    const wrapper = mount(defineComponent({
      directives: { motion: directive },
      template: `<div v-motion="{ initial: { opacity: 0.3 } }" data-testid="box" />`,
    }))
    await nextTick()
    const el = wrapper.find('[data-testid="box"]').element as HTMLElement
    expect(el.style.opacity).toBe('0.3')
  })

  it('works with createMotionDirective without bundle', async () => {
    const directive = createMotionDirective()
    const wrapper = mount(defineComponent({
      directives: { motion: directive },
      template: `<div v-motion="{ initial: { opacity: 0.7 } }" data-testid="box" />`,
    }))
    await nextTick()
    const el = wrapper.find('[data-testid="box"]').element as HTMLElement
    expect(el.style.opacity).toBe('0.7')
  })

  it('applies variant-based initial and animate', async () => {
    const wrapper = mount(defineComponent({
      directives: { motion: vMotion },
      template: `<div v-motion="motionProps" data-testid="box" />`,
      setup() {
        return {
          motionProps: {
            initial: 'hidden',
            animate: 'visible',
            variants: {
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0 },
            },
            transition: { duration: 0.05 },
          },
        }
      },
    }))
    await nextTick()
    const el = wrapper.find('[data-testid="box"]').element as HTMLElement
    // Initial state should apply hidden variant
    expect(el.style.opacity).toBe('0')
    expect(el.style.transform).toContain('translateX(-50px)')
    // After animation completes, should have visible variant
    await delay(200)
    expect(Number(el.style.opacity)).toBe(1)
  })

  describe('vNode props extraction', () => {
    it('extracts initial and animate from VNode props', async () => {
      const wrapper = mount(defineComponent({
        directives: { motion: vMotion },
        setup() {
          return {
            initialVal: { opacity: 0, y: 30 },
            animateVal: { opacity: 1, y: 0 },
            transitionVal: { duration: 0.05 },
          }
        },
        template: `<div v-motion :initial="initialVal" :animate="animateVal" :transition="transitionVal" data-testid="box" />`,
      }))
      await nextTick()
      const el = wrapper.find('[data-testid="box"]').element as HTMLElement
      expect(el.style.opacity).toBe('0')
      expect(el.style.transform).toContain('translateY(30px)')
      await delay(200)
      expect(Number(el.style.opacity)).toBe(1)
    })

    it('extracts whileHover from VNode props', async () => {
      const wrapper = mount(defineComponent({
        directives: { motion: vMotion },
        setup() {
          return {
            hoverVal: { scale: 1.2 },
          }
        },
        template: `<div v-motion :whileHover="hoverVal" data-testid="box" />`,
      }))
      await nextTick()
      const el = wrapper.find('[data-testid="box"]').element as HTMLElement
      // Should mount without errors, whileHover stored in state
      expect(el).toBeTruthy()
    })

    it('vNode props override binding value', async () => {
      const wrapper = mount(defineComponent({
        directives: { motion: vMotion },
        setup() {
          return {
            bindingVal: { initial: { opacity: 0.5 }, transition: { duration: 0.05 } },
            initialOverride: { opacity: 0.2 },
          }
        },
        template: `<div v-motion="bindingVal" :initial="initialOverride" data-testid="box" />`,
      }))
      await nextTick()
      const el = wrapper.find('[data-testid="box"]').element as HTMLElement
      // VNode prop :initial should override binding value's initial
      expect(el.style.opacity).toBe('0.2')
    })

    it('cleans motion attributes from DOM', async () => {
      const wrapper = mount(defineComponent({
        directives: { motion: vMotion },
        setup() {
          return {
            initialVal: { opacity: 0 },
          }
        },
        template: `<div v-motion :initial="initialVal" data-testid="box" />`,
      }))
      await nextTick()
      const el = wrapper.find('[data-testid="box"]').element as HTMLElement
      // Motion-specific attributes should be cleaned from DOM
      expect(el.hasAttribute('initial')).toBe(false)
    })

    it('works with v-motion as marker only (no binding value)', async () => {
      const wrapper = mount(defineComponent({
        directives: { motion: vMotion },
        setup() {
          return {
            initialVal: { opacity: 0.4, x: 10 },
          }
        },
        template: `<div v-motion :initial="initialVal" data-testid="box" />`,
      }))
      await nextTick()
      const el = wrapper.find('[data-testid="box"]').element as HTMLElement
      expect(el.style.opacity).toBe('0.4')
      expect(el.style.transform).toContain('translateX(10px)')
    })
  })

  describe('getSSRProps', () => {
    it('returns initial styles for SSR rendering', () => {
      const directive = vMotion
      const binding = { value: { initial: { opacity: 0, y: 20 } } } as any
      const result = directive.getSSRProps!(binding, {} as any, {} as any)
      expect(result).toHaveProperty('style')
      expect(result.style).toHaveProperty('opacity', 0)
      expect(result.style).toHaveProperty('transform')
    })

    it('resolves variant-based initial for SSR', () => {
      const directive = vMotion
      const binding = {
        value: {
          initial: 'hidden',
          variants: {
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 },
          },
        },
      } as any
      const result = directive.getSSRProps!(binding, {} as any, {} as any)
      expect(result).toHaveProperty('style')
      expect(result.style).toHaveProperty('opacity', 0)
    })

    it('resolves animate values when initial is false', () => {
      const directive = vMotion
      const binding = { value: { initial: false, animate: { opacity: 0.8, y: 10 } } } as any
      const result = directive.getSSRProps!(binding, {} as any, {} as any)
      expect(result).toHaveProperty('style')
      expect(result.style).toHaveProperty('opacity', 0.8)
    })

    it('returns empty object when no initial and no animate', () => {
      const directive = vMotion
      const binding = { value: {} } as any
      const result = directive.getSSRProps!(binding, {} as any, {} as any)
      expect(result).toEqual({})
    })
  })

  describe('motionPlugin', () => {
    it('registers v-motion directive globally', () => {
      const app = createApp({ template: '<div />' })
      app.use(MotionPlugin)
      // Plugin registers directive; verify no errors
      expect(app.directive('motion')).toBeDefined()
    })

    it('accepts custom featureBundle option', () => {
      const app = createApp({ template: '<div />' })
      app.use(MotionPlugin, { featureBundle: domAnimation })
      expect(app.directive('motion')).toBeDefined()
    })
  })
})
