import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { Motion } from '@/components'
import { delay } from '@/shared/test'

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
    // console.log(wrapper.getByTestId('motion'))
    await wrapper.getByTestId('motion').focus()
    await delay(50)
    expect(wrapper.getByTestId('motion').style.transform).toBe('scale(1.2)')
    expect(wrapper.getByTestId('motion').style.boxShadow).toBe('0 0 0 2px rgba(255, 0, 136, 1)')
    await wrapper.getByTestId('motion').blur()
    await delay(50)
    expect(wrapper.getByTestId('motion').style.transform).toBe('none')
    expect(wrapper.getByTestId('motion').style.boxShadow).toBe('')
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

    await wrapper.getByTestId('motion').focus()
    await delay(50)
    expect(wrapper.getByTestId('motion').style.transform).toBe('scale(1.1)')
  })
})
