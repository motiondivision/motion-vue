/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { motion } from '@/components'

describe('transformTemplate', () => {
  it('formats the transform Vue writes on each patch', async () => {
    const label = ref('a')
    const wrapper = mount(defineComponent({
      setup: () => () => h(motion.div, {
        style: { x: 10 },
        transformTemplate: (_: unknown, generated: string) => `${generated} rotate(1deg)`,
      }, () => label.value),
    }))
    const el = wrapper.element as HTMLElement
    expect(el.style.transform).toBe('translateX(10px) rotate(1deg)')

    label.value = 'b'
    await nextTick()
    expect(el.style.transform).toBe('translateX(10px) rotate(1deg)')
  })
})
