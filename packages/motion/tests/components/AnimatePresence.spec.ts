import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AnimatePresence from '../../src/components/AnimatePresence.vue'
import Motion from '../../src/components/Motion.vue'

describe('animatePresence', () => {
  it('renders children', () => {
    const wrapper = mount(AnimatePresence, {
      slots: {
        default: '<div>Test Content</div>',
      },
    })
    expect(wrapper.text()).toBe('Test Content')
  })

  it('handles mode prop correctly', () => {
    const wrapper = mount(AnimatePresence, {
      props: {
        mode: 'wait',
      },
      slots: {
        default: '<div>Test</div>',
      },
    })

    expect(wrapper.vm.$props.mode).toBe('wait')
  })

  it('works with Motion components', () => {
    const wrapper = mount(AnimatePresence, {
      slots: {
        default: Motion,
      },
      global: {
        components: {
          Motion,
        },
      },
    })

    expect(wrapper.findComponent(Motion).exists()).toBe(true)
  })
})
