/** @jsxRuntime classic */
/** @jsxImportSource vue */
import { mount } from '@vue/test-utils'
import { Motion } from '@/components'
import { describe, expect, it } from 'vitest'
import { delay } from '@/shared/test'

describe('gesture', () => {
  it('hover effect triggered by parent', async () => {
    const wrapper = mount({
      setup() {
        return () => (
          // @ts-ignore
          <Motion hover="hover" data-testid="motion">
            {/* @ts-ignore */}
            <Motion data-testid="motion-child" variants={{ hover: { scale: 1.2 } }} />
          </Motion>
        )
      },
    })
    wrapper.find('[data-testid="motion"]').trigger('pointerenter')
    await delay(300)
    expect(wrapper.find('[data-testid="motion-child"]').element.getAttribute('style')).toBe('transform: scale(1.2);')
    wrapper.find('[data-testid="motion"]').trigger('pointerleave')
    await delay(300)
    expect(wrapper.find('[data-testid="motion-child"]').element.getAttribute('style')).toBe('transform: none;')
  })
})
