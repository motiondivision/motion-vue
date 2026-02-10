import { describe, expect, it } from 'vitest'
import { fireEvent, render } from '@testing-library/vue'
import { Motion } from '@/components'
import { delay } from '@/shared/test'
import { nextTick } from 'vue'

/**
 * Mock :focus-visible on an element.
 * Happy-dom returns false for :focus-visible on programmatic focus,
 * but in real browsers keyboard-triggered focus would match.
 */
function mockFocusVisible(el: Element) {
  const origMatches = el.matches.bind(el)
  el.matches = (selector: string) =>
    selector === ':focus-visible' ? true : origMatches(selector)
}

describe('focus behavior', () => {
  it('should trigger whileFocus when element receives focus', async () => {
    const wrapper = render(Motion, {
      props: {
        whileFocus: { scale: 1.2, boxShadow: '0 0 0 2px #ff0088' },
        transition: { duration: 0 },
      },
      attrs: {
        'data-testid': 'motion',
      },
    })
    await nextTick()
    const el = wrapper.getByTestId('motion')
    mockFocusVisible(el)
    await fireEvent.focus(el)
    await delay(50)
    expect(el.style.transform).toBe('scale(1.2)')
    expect(el.style.boxShadow).toBe('0 0 0 2px #ff0088')
    await fireEvent.blur(el)
    await delay(50)
    expect(el.style.transform).toBe('none')
    expect(el.style.boxShadow).not.toBe('0 0 0 2px #ff0088')
  })

  it('should handle focus prop (deprecated)', async () => {
    const wrapper = render(Motion, {
      props: {
        focus: { scale: 1.1 },
        transition: { duration: 0 },
      },
      attrs: {
        'data-testid': 'motion',
      },
    })
    await nextTick()
    const el = wrapper.getByTestId('motion')
    mockFocusVisible(el)
    await fireEvent.focus(el)
    await delay(50)
    expect(el.style.transform).toBe('scale(1.1)')
  })
})
