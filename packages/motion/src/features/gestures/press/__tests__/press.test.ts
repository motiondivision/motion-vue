import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/vue'
import { Motion } from '@/components'
import { nextTick } from 'vue'

// Mock framer-motion press
vi.mock('framer-motion/dom', async () => {
  const actual = await vi.importActual('framer-motion/dom')
  return {
    ...actual,
    press: vi.fn((element) => {
      // 模拟 press 的行为
      element.setAttribute('tabindex', '0')
      return (actual.press as any)(element)
    }),
  }
})
describe('press gesture', () => {
  it('adds tabindex=0 when whilePress is set', async () => {
    const wrapper = render(Motion, {
      props: {
        whilePress: { scale: 0.9 },
      },
      attrs: {
        'data-testid': 'motion',
      },
    })
    await nextTick()
    const motion = wrapper.getByTestId('motion')
    expect(motion.tabIndex).toBe(0)
  })

  it('does not add tabindex when whilePress is not set', () => {
    const wrapper = render(Motion, {
      props: {},
      attrs: {
        'data-testid': 'motion',
      },
    })

    expect(wrapper.getByTestId('motion').tabIndex).toBe(-1)
  })
})
