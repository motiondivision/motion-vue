import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { Motion } from '@/components'
import { nextTick } from 'vue'

describe('press gesture', () => {
  // motion-dom's press() sets tabindex=0 on non-interactive elements,
  // but relies on isHTMLElement (checks "offsetHeight" in element) which
  // returns false in happy-dom. This behavior is verified via E2E tests.
  it.skip('adds tabindex=0 when whilePress is set', async () => {
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
