import { defineComponent, h, nextTick } from 'vue'
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { LazyMotion, Reorder } from '@/components'
import { domMax } from '@/features'

describe('reorder inside LazyMotion', () => {
  it('renders the lightweight m component instead of the full motion bundle', async () => {
    const wrapper = render(defineComponent({
      setup: () => () => h(LazyMotion, { features: domMax, strict: true }, {
        default: () => h(Reorder.Group, { values: ['a'], axis: 'y' }, {
          default: () => h(Reorder.Item, { value: 'a' }, { default: () => 'a' }),
        }),
      }),
    }))
    await nextTick()

    // Strict LazyMotion throws when a child renders the full Motion
    // component, so reaching the item text means both rendered `m`.
    expect(wrapper.getByText('a')).toBeTruthy()
  })
})
