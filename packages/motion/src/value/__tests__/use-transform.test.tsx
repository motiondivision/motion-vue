import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Motion } from '@/components'
import { defineComponent, onMounted, ref } from 'vue'
import { useTransform } from '@/value/use-transform'
import { delay } from '@/shared/test'
import { motionValue } from 'framer-motion/dom'

describe('useTransform', () => {
  it('should update when reactive value changes', async () => {
    const Component = defineComponent({
      setup() {
        const x = ref(0)
        const transform = useTransform(() => {
          return x.value
        })
        onMounted(() => {
          x.value = 100
        })
        return () => {
          return <Motion style={{ x: transform }} />
        }
      },
    })
    const wrapper = mount(Component)
    await delay(100)
    expect(wrapper.html()).toContain('100')
  })

  it('should support reactive inputRange (single output)', async () => {
    const x = motionValue(50)
    const inputRange = ref([0, 100])
    const opacity = useTransform(x, inputRange, [0, 1])

    await delay(50)
    expect(opacity.get()).toBe(0.5)

    // Change input range
    inputRange.value = [0, 50]
    await delay(50)
    expect(opacity.get()).toBe(1)
  })

  describe('multi-output transform', () => {
    it('should transform single input to multiple outputs', () => {
      const x = motionValue(0)
      const result = useTransform(x, [0, 100], {
        opacity: [0, 1],
        scale: [0.5, 1],
      })

      expect(result).toHaveProperty('opacity')
      expect(result).toHaveProperty('scale')
      expect(result.opacity.get()).toBe(0)
      expect(result.scale.get()).toBe(0.5)
    })

    it('should update multiple outputs when input changes', async () => {
      const x = motionValue(0)
      const result = useTransform(x, [0, 100], {
        opacity: [0, 1],
        scale: [0.5, 1],
      })

      x.set(50)
      await delay(50)
      expect(result.opacity.get()).toBe(0.5)
      expect(result.scale.get()).toBe(0.75)

      x.set(100)
      await delay(50)
      expect(result.opacity.get()).toBe(1)
      expect(result.scale.get()).toBe(1)
    })

    it('should support reactive inputRange with multi-output', async () => {
      const x = motionValue(50)
      const inputRange = ref([0, 100])
      const result = useTransform(x, inputRange, {
        opacity: [0, 1],
        scale: [0.5, 1],
      })

      await delay(50)
      expect(result.opacity.get()).toBe(0.5)
      expect(result.scale.get()).toBe(0.75)

      // Change input range
      inputRange.value = [0, 50]
      await delay(50)
      expect(result.opacity.get()).toBe(1)
      expect(result.scale.get()).toBe(1)
    })

    it('should work with transform options (clamp)', () => {
      const x = motionValue(150)
      const result = useTransform(
        x,
        [0, 100],
        {
          opacity: [0, 1],
          scale: [0.5, 1],
        },
        { clamp: true },
      )

      // Values should be clamped
      expect(result.opacity.get()).toBe(1)
      expect(result.scale.get()).toBe(1)
    })

    it('should work with transform options (clamp: false)', () => {
      const x = motionValue(150)
      const result = useTransform(
        x,
        [0, 100],
        {
          opacity: [0, 1],
          scale: [0.5, 1],
        },
        { clamp: false },
      )

      // Values should extrapolate beyond range
      expect(result.opacity.get()).toBeGreaterThan(1)
      expect(result.scale.get()).toBeGreaterThan(1)
    })

    it('should work in Motion component', async () => {
      const Component = defineComponent({
        setup() {
          const x = motionValue(0)
          const transformed = useTransform(x, [0, 100], {
            opacity: [0, 1],
            scale: [0.5, 1],
          })

          onMounted(() => {
            x.set(100)
          })

          return () => {
            return (
              <Motion
                style={{
                  opacity: transformed.opacity,
                  scale: transformed.scale,
                  x,
                }}
              />
            )
          }
        },
      })

      const wrapper = mount(Component)
      await delay(100)

      const element = wrapper.element as HTMLElement
      expect(element.style.opacity).toBe('1')
    })

    it('should handle non-numeric output ranges', async () => {
      const x = motionValue(0)
      const result = useTransform(x, [0, 100], {
        backgroundColor: ['#000000', '#ffffff'],
        borderRadius: ['0px', '10px'],
      })

      // Framer Motion converts colors to rgba format
      expect(result.backgroundColor.get()).toBe('rgba(0, 0, 0, 1)')
      expect(result.borderRadius.get()).toBe('0px')

      x.set(50)
      await delay(50)
      // At 50%, should be middle gray
      const bgColor = result.backgroundColor.get() as string
      expect(bgColor).toBe('rgba(180, 180, 180, 1)')
      expect(result.borderRadius.get()).toBe('5px')
    })
  })
})
