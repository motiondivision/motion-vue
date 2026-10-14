import type { ReorderContextProps } from '../context'
import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Reorder } from '@/index'
import { useReorderContext } from '../context'
import { nextFrames, pointerDown, pointerMove, pointerUp } from '@/features/gestures/__tests__/utils'

/**
 * framer-motion #2682: the pointer release that ends a reordering drag must
 * not fire a click on the item under it.
 */
describe('reorder: click after drag', () => {
  let context: ReorderContextProps<string> | null = null

  const ContextCapture = defineComponent({
    setup() {
      context = useReorderContext()
      return () => null
    },
  })

  afterEach(() => {
    document.body.innerHTML = ''
    context = null
  })

  function setup() {
    const handlers = {
      onUpdateValues: vi.fn(),
      onGroupClick: vi.fn(),
      onItemClick: vi.fn(),
      onChildClick: vi.fn(),
    }
    const items = ref(['a', 'b'])
    const wrapper = render(defineComponent({
      setup() {
        return () => h(Reorder.Group as any, {
          'values': items.value,
          'onUpdate:values': (newOrder: string[]) => {
            handlers.onUpdateValues(newOrder)
            items.value = newOrder
          },
          'axis': 'y',
          'data-testid': 'group',
          'onClick': handlers.onGroupClick,
        }, () => [
          h(ContextCapture),
          ...items.value.map(item =>
            h(Reorder.Item as any, {
              'key': item,
              'value': item,
              'data-testid': item,
              'onClick': handlers.onItemClick,
            }, () => h('button', {
              'data-testid': `${item}-child`,
              'onClick': handlers.onChildClick,
            })),
          ),
        ])
      },
    }))

    // happy-dom has no layout, so give the items one
    context!.registerItem!('a', { x: { min: 0, max: 100 }, y: { min: 0, max: 50 } })
    context!.registerItem!('b', { x: { min: 0, max: 100 }, y: { min: 50, max: 100 } })

    return { ...handlers, ...wrapper }
  }

  async function reorderDrag(element: Element) {
    pointerDown(element, 50, 25)
    pointerMove(50, 40)
    await nextFrames(2)
    pointerMove(50, 100)
    await nextFrames(2)
    pointerUp(50, 100)
  }

  // A pointer-generated click, which browsers fire straight after pointerup
  function click(element: Element) {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }))
  }

  it.each(['a', 'a-child'])("doesn't click %s on the release that ends a reordering drag", async (target) => {
    const { onUpdateValues, onGroupClick, onItemClick, onChildClick, getByTestId } = setup()

    // Press where the click will land, so it's a descendant of the press
    pointerDown(getByTestId(target), 50, 25)
    pointerMove(50, 40)
    await nextFrames(2)
    pointerMove(50, 100)
    await nextFrames(2)
    pointerUp(50, 100)
    expect(onUpdateValues).toHaveBeenCalledWith(['b', 'a'])

    click(getByTestId(target))
    expect(onItemClick).not.toHaveBeenCalled()
    expect(onChildClick).not.toHaveBeenCalled()
    expect(onGroupClick).not.toHaveBeenCalled()
  })

  it('clicks after a drag that doesn\'t reorder', async () => {
    const { onUpdateValues, onItemClick, onGroupClick, getByTestId } = setup()

    await nextTick()
    pointerDown(getByTestId('a'), 50, 25)
    pointerMove(150, 25)
    await nextFrames(2)
    pointerUp(150, 25)
    expect(onUpdateValues).not.toHaveBeenCalled()

    click(getByTestId('a'))
    expect(onItemClick).toHaveBeenCalledTimes(1)
    expect(onGroupClick).toHaveBeenCalledTimes(1)
  })

  it('clicks as normal once the drag has ended', async () => {
    const { onItemClick, getByTestId } = setup()

    await reorderDrag(getByTestId('a'))
    await nextFrames(1)

    click(getByTestId('a'))
    expect(onItemClick).toHaveBeenCalledTimes(1)
  })

  it('clicks as normal on the next press', async () => {
    const { onItemClick, getByTestId } = setup()

    await reorderDrag(getByTestId('a'))
    pointerDown(getByTestId('b'), 50, 75)
    pointerUp(50, 75)

    click(getByTestId('b'))
    expect(onItemClick).toHaveBeenCalledTimes(1)
  })

  it('fires clicks with no pointer press behind them', async () => {
    const { onChildClick, getByTestId } = setup()

    await reorderDrag(getByTestId('a'))

    // e.g. Enter on a focused button
    ;(getByTestId('a-child') as HTMLElement).click()
    expect(onChildClick).toHaveBeenCalledTimes(1)
  })
})
