import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Motion } from '@/components'
import { defineComponent, nextTick, onMounted, ref, watchEffect } from 'vue'
import { useTransform } from '@/value/use-transform'
import { delay } from '@/shared/test'

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
})
