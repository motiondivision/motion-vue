import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Motion from '../../src/components/Motion.vue'

describe('motion', () => {
  it('renders default element as div', () => {
    const wrapper = mount(Motion)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders custom element when as prop is provided', () => {
    const wrapper = mount(Motion, {
      props: {
        as: 'span',
        asChild: false,
      },
    })
    // 更严格的测试
    expect(wrapper.html()).toMatch(/<span[^>]*>/)
  })

  it('applies initial animation props', async () => {
    const wrapper = mount(Motion, {
      props: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      },
    })

    expect(wrapper.get('div').attributes('style')).toContain('opacity: 0')
  })
})
