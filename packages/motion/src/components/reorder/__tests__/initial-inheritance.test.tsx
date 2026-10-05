import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Motion, Reorder } from '@/index'
import { nextTick, ref } from 'vue'

/**
 * Issue #276: Reorder.Group's withDefaults omitted the Boolean-typed
 * MotionProps defaults, so Vue cast the absent ones to false and bindProps()
 * spread them onto the inner Motion — most visibly `initial: false`, which
 * made Reorder.Items with only `variants` render at `visible` and skip their
 * initial animation.
 */
describe('reorder.Group prop defaults (#276)', () => {
  it('items with only variants inherit initial and play the initial animation', async () => {
    const parentVariants = {
      hidden: {},
      visible: {},
    }
    const itemVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 1 } },
    }

    const wrapper = mount({
      components: { Motion, ReorderGroup: Reorder.Group, ReorderItem: Reorder.Item },
      setup() {
        const items = ref([1, 2, 3])
        return { items, parentVariants, itemVariants }
      },
      template: `
        <Motion initial="hidden" animate="visible" :variants="parentVariants">
          <ReorderGroup v-model:values="items">
            <ReorderItem
              v-for="item in items"
              :key="item"
              :value="item"
              :variants="itemVariants"
              :data-testid="'reorder-item-' + item"
            >
              Item {{ item }}
            </ReorderItem>
          </ReorderGroup>
        </Motion>
      `,
    })

    await nextTick()

    // First render must resolve from the inherited `hidden` variant —
    // with the bug the item rendered at `visible` (opacity 1) immediately
    const item = wrapper.find('[data-testid="reorder-item-1"]')
    expect(item.attributes('style')).toContain('opacity: 0')

    // The initial animation runs towards the inherited `visible` variant
    await new Promise(resolve => setTimeout(resolve, 100))
    const midOpacity = Number.parseFloat(
      (wrapper.find('[data-testid="reorder-item-1"]').element as HTMLElement).style.opacity,
    )
    expect(midOpacity).toBeGreaterThan(0)
    expect(midOpacity).toBeLessThan(1)
  })
})
