import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { motionValue } from 'framer-motion/dom'
import RowValue from '../RowValue.vue'

describe('row-value', () => {
  it('should render initial value', () => {
    const value = motionValue(10)
    const wrapper = mount(RowValue, {
      props: {
        value,
      },
    })

    expect(wrapper.text()).toBe('10')
  })

  it('should update when value changes', async () => {
    const value = motionValue('initial')
    const wrapper = mount(RowValue, {
      props: {
        value,
      },
    })

    expect(wrapper.text()).toBe('initial')

    value.set('updated')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toBe('updated')
  })

  it('should cleanup subscription on unmount', async () => {
    const value = motionValue('test')
    const unsubscribe = vi.fn()
    vi.spyOn(value, 'on').mockImplementation(unsubscribe)

    const wrapper = mount(RowValue, {
      props: {
        value,
      },
    })

    await wrapper.unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('should handle different value types', () => {
    const numberValue = motionValue(42)
    const numberWrapper = mount(RowValue, {
      props: { value: numberValue },
    })
    expect(numberWrapper.text()).toBe('42')

    const stringValue = motionValue('hello')
    const stringWrapper = mount(RowValue, {
      props: { value: stringValue },
    })
    expect(stringWrapper.text()).toBe('hello')

    const boolValue = motionValue(true)
    const boolWrapper = mount(RowValue, {
      props: { value: boolValue },
    })
    expect(boolWrapper.text()).toBe('true')
  })

  it('should update DOM element directly when value changes', async () => {
    const value = motionValue('initial')
    const wrapper = mount(RowValue, {
      props: { value },
    })

    const el = wrapper.element
    value.set('updated via DOM')
    await wrapper.vm.$nextTick()

    expect(el.textContent).toBe('updated via DOM')
  })
})
