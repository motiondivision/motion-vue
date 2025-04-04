import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { Motion } from '@/components'
import { motionValue } from 'framer-motion/dom'
import { nextTick } from 'vue'
import { delay } from '@/shared/test'

describe('row-value', () => {
  it('should render initial value', async () => {
    const opacity = motionValue(0)
    const stroke = motionValue('red')
    const wrapper = render(Motion, {
      props: {
        as: 'path',
        style: {
          opacity,
          stroke,
        },
      },
      attrs: {
        'data-testid': 'path',
      },
    })
    await nextTick()
    const path = wrapper.getByTestId('path')
    expect(path.style.opacity).toBeFalsy()
    expect(path.style.stroke).toBeFalsy()
    expect(path.getAttribute('stroke')).toBe('red')
    expect(path.getAttribute('opacity')).toBe('0')
    opacity.set(1)
    stroke.set('blue')
    await delay(100)
    expect(path.style.opacity).toBeFalsy()
    expect(path.style.stroke).toBeFalsy()
    expect(path.getAttribute('stroke')).toBe('blue')
    expect(path.getAttribute('opacity')).toBe('1')
  })
  it('should update stroke-width through attributes instead of style', async () => {
    const strokeWidth = motionValue(2)
    const wrapper = render(Motion, {
      props: {
        as: 'path',
        style: {
          strokeWidth,
        },
      },
      attrs: {
        'data-testid': 'path',
      },
    })
    await nextTick()
    const path = wrapper.getByTestId('path')
    expect(path.style.strokeWidth).toBeFalsy()
    expect(path.getAttribute('stroke-width')).toBe('2')
    strokeWidth.set(4)
    await delay(100)
    expect(path.style.strokeWidth).toBeFalsy()
    expect(path.getAttribute('stroke-width')).toBe('4')
  })
})
