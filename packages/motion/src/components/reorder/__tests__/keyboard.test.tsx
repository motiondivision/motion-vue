import type { ReorderContextProps } from '../context'
import type { ReorderAxis } from '../types'
import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { motionValue } from 'motion-dom'
import { Reorder } from '@/index'
import { mountedStates } from '@/state'
import { nextFrames } from '@/features/gestures/__tests__/utils'
import { useReorderContext } from '../context'

let currentContext: ReorderContextProps<string> | null = null

const ContextCapture = defineComponent({
  setup() {
    currentContext = useReorderContext()
    return () => null
  },
})

function order(container: HTMLElement) {
  return Array.from(container.querySelectorAll('li')).map(item => item.getAttribute('data-testid'))
}

function isGrabbed(element: Element) {
  return Boolean(mountedStates.get(element)?.visualElement.animationState?.getState().whileDrag.isActive)
}

async function press(element: Element, key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  const result = element.dispatchEvent(event)
  await nextTick()
  return result
}

describe('reorder keyboard', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    currentContext = null
  })

  async function setup(options: {
    initial?: string[]
    axis?: ReorderAxis
    dir?: 'rtl'
    onUpdateValues?: ReturnType<typeof vi.fn>
    itemProps?: Record<string, any>
    unrendered?: string[]
  } = {}) {
    const items = ref(options.initial ?? ['a', 'b', 'c'])
    const onUpdateValues = options.onUpdateValues ?? vi.fn()
    const wrapper = render(defineComponent({
      setup() {
        return () => h(Reorder.Group as any, {
          'values': items.value,
          'onUpdate:values': (newOrder: string[], moved: string) => {
            onUpdateValues(newOrder, moved)
            items.value = newOrder
          },
          'axis': options.axis ?? 'y',
          'style': options.dir ? { direction: options.dir } : undefined,
        }, () => [
          h(ContextCapture),
          ...items.value.filter(item => !options.unrendered?.includes(item)).map(item => h(Reorder.Item as any, {
            'key': item,
            'value': item,
            'data-testid': item,
            'whileDrag': { opacity: 0.5 },
            ...options.itemProps,
          }, () => [item, h('input', { 'data-testid': `${item}-input` })])),
        ])
      },
    }))

    await nextTick()
    registerLayouts(wrapper.container)

    function registerLayouts(container: HTMLElement) {
      Array.from(container.querySelectorAll('li')).forEach((item, index) => {
        currentContext!.registerItem!(item.getAttribute('data-testid')!, {
          x: { min: index * 100, max: index * 100 + 100 },
          y: { min: index * 50, max: index * 50 + 50 },
        })
      })
    }

    return { ...wrapper, items, onUpdateValues, registerLayouts }
  }

  it('makes items focusable and lets items override tabIndex', async () => {
    const { getByTestId, unmount } = await setup()
    expect(getByTestId('a').tabIndex).toBe(0)
    unmount()

    const overridden = await setup({ itemProps: { tabindex: -1 } })
    expect(overridden.getByTestId('a').tabIndex).toBe(-1)
  })

  it('grabs with Space, moves with arrows, and drops with Space', async () => {
    const { container, getByTestId, onUpdateValues } = await setup()
    const a = getByTestId('a')

    expect(await press(a, 'ArrowDown')).toBe(true)
    expect(onUpdateValues).not.toHaveBeenCalled()

    expect(await press(a, ' ')).toBe(false)
    expect(isGrabbed(a)).toBe(true)
    expect(onUpdateValues).not.toHaveBeenCalled()

    expect(await press(a, 'ArrowDown')).toBe(false)
    expect(onUpdateValues).toHaveBeenLastCalledWith(['b', 'a', 'c'], 'a')
    expect(order(container)).toEqual(['b', 'a', 'c'])
    expect(isGrabbed(a)).toBe(true)

    await press(a, 'ArrowDown')
    expect(order(container)).toEqual(['b', 'c', 'a'])
    await press(a, 'ArrowUp')
    expect(order(container)).toEqual(['b', 'a', 'c'])

    expect(await press(a, ' ')).toBe(false)
    expect(isGrabbed(a)).toBe(false)
    expect(await press(a, 'ArrowDown')).toBe(true)
    expect(order(container)).toEqual(['b', 'a', 'c'])
    expect(onUpdateValues).toHaveBeenCalledTimes(3)
  })

  it('leaves Enter and unrelated keys alone', async () => {
    const { getByTestId, onUpdateValues } = await setup()
    const b = getByTestId('b')

    expect(await press(b, 'Enter')).toBe(true)
    expect(isGrabbed(b)).toBe(false)
    expect(await press(b, 'ArrowUp')).toBe(true)

    await press(b, ' ')
    for (const key of ['ArrowLeft', 'ArrowRight', 'Tab', 'a', 'Enter'])
      expect(await press(b, key)).toBe(true)
    expect(onUpdateValues).not.toHaveBeenCalled()
    expect(isGrabbed(b)).toBe(true)
  })

  it('ignores repeat, modifiers, nested controls, and prevented events', async () => {
    let prevent = false
    const onKeyDown = vi.fn((event: KeyboardEvent) => {
      if (prevent)
        event.preventDefault()
    })
    const { getByTestId, onUpdateValues } = await setup({ itemProps: { onKeyDown } })
    const a = getByTestId('a')
    const input = getByTestId('a-input')

    await press(a, ' ')
    expect(await press(a, ' ', { repeat: true })).toBe(false)
    expect(isGrabbed(a)).toBe(true)
    await press(a, ' ', { repeat: true })
    expect(isGrabbed(a)).toBe(true)
    await press(a, ' ')

    for (const modifier of ['altKey', 'ctrlKey', 'metaKey'])
      expect(await press(a, ' ', { [modifier]: true })).toBe(true)
    expect(isGrabbed(a)).toBe(false)

    expect(await press(input, ' ')).toBe(true)
    expect(isGrabbed(a)).toBe(false)
    await press(a, ' ')
    expect(await press(input, 'ArrowDown')).toBe(true)
    expect(await press(input, 'Escape')).toBe(true)
    expect(onUpdateValues).not.toHaveBeenCalled()

    for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
      expect(await press(a, 'ArrowDown', { [modifier]: true })).toBe(true)
      expect(await press(a, 'Escape', { [modifier]: true })).toBe(true)
    }
    expect(onUpdateValues).not.toHaveBeenCalled()
    expect(isGrabbed(a)).toBe(true)

    prevent = true
    expect(await press(a, 'ArrowDown')).toBe(false)
    expect(await press(a, 'Escape')).toBe(false)
    expect(isGrabbed(a)).toBe(true)
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('restores the order from the latest grab with Escape', async () => {
    const { container, getByTestId, onUpdateValues } = await setup()
    const a = getByTestId('a')

    await press(a, ' ')
    await press(a, 'ArrowDown')
    expect(order(container)).toEqual(['b', 'a', 'c'])
    await press(a, ' ')
    await press(a, ' ')
    await press(a, 'ArrowDown')
    expect(order(container)).toEqual(['b', 'c', 'a'])

    expect(await press(a, 'Escape')).toBe(false)
    expect(onUpdateValues).toHaveBeenLastCalledWith(['b', 'a', 'c'], 'a')
    expect(order(container)).toEqual(['b', 'a', 'c'])
    expect(isGrabbed(a)).toBe(false)

    await press(a, ' ')
    expect(await press(a, 'Escape')).toBe(false)
    expect(onUpdateValues).toHaveBeenCalledTimes(3)
  })

  it('drops on blur and keeps focus through keyed reorders', async () => {
    const { container, getByTestId, onUpdateValues } = await setup()
    const a = getByTestId('a') as HTMLElement
    a.focus()
    await press(a, ' ')
    await press(a, 'ArrowDown')

    expect(document.activeElement).toBe(a)
    expect(order(container)).toEqual(['b', 'a', 'c'])
    expect(isGrabbed(a)).toBe(true)

    ;(getByTestId('c') as HTMLElement).focus()
    await nextTick()
    expect(isGrabbed(a)).toBe(false)
    expect(order(container)).toEqual(['b', 'a', 'c'])

    a.focus()
    expect(await press(a, 'ArrowDown')).toBe(true)
    expect(onUpdateValues).toHaveBeenCalledTimes(1)
  })

  it('supports x, xy, and RTL arrow commands', async () => {
    const horizontal = await setup({ axis: 'x', dir: 'rtl' })
    await press(horizontal.getByTestId('a'), ' ')
    await press(horizontal.getByTestId('a'), 'ArrowLeft')
    expect(order(horizontal.container)).toEqual(['b', 'a', 'c'])
    expect(await press(horizontal.getByTestId('a'), 'ArrowDown')).toBe(true)
    horizontal.unmount()
    currentContext = null

    const grid = await setup({ axis: 'xy' })
    const a = grid.getByTestId('a')
    await press(a, ' ')
    await press(a, 'ArrowRight')
    await press(a, 'ArrowDown')
    await press(a, 'ArrowUp')
    await press(a, 'ArrowLeft')
    expect(order(grid.container)).toEqual(['a', 'b', 'c'])
  })

  it('commits measured values to their current slots', async () => {
    const { getByTestId, onUpdateValues } = await setup({ initial: ['a', 'hidden', 'b'], unrendered: ['hidden'] })
    const a = getByTestId('a')

    await press(a, ' ')
    await press(a, 'ArrowDown')
    expect(onUpdateValues).toHaveBeenLastCalledWith(['b', 'hidden', 'a'], 'a')
  })

  it('keeps values added during a grab when Escape restores the order', async () => {
    const { container, getByTestId, items, onUpdateValues, registerLayouts } = await setup()
    const b = getByTestId('b')

    await press(b, ' ')
    items.value = ['new', 'a', 'b', 'c', 'end']
    await nextTick()
    registerLayouts(container)
    await press(b, 'ArrowDown')
    expect(onUpdateValues).toHaveBeenLastCalledWith(['new', 'a', 'c', 'b', 'end'], 'b')

    await nextTick()
    registerLayouts(container)
    await press(b, 'Escape')
    expect(onUpdateValues).toHaveBeenLastCalledWith(['new', 'a', 'b', 'c', 'end'], 'b')
    expect(order(container)).toEqual(['new', 'a', 'b', 'c', 'end'])
  })

  it('activates whileDrag without firing pointer drag callbacks', async () => {
    const onDragStart = vi.fn()
    const onDragEnd = vi.fn()
    const opacity = motionValue(1)
    const { getByTestId } = await setup({
      itemProps: {
        onDragStart,
        onDragEnd,
        transition: { type: false },
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        style: { opacity },
      },
    })
    const a = getByTestId('a') as HTMLElement

    await press(a, ' ')
    await nextFrames(1)
    expect(opacity.get()).toBe(0.5)

    await press(a, ' ')
    await nextFrames(2)
    expect(opacity.get()).toBe(1)
    expect(onDragStart).not.toHaveBeenCalled()
    expect(onDragEnd).not.toHaveBeenCalled()

    await press(a, ' ')
    a.focus()
    a.blur()
    await nextFrames(2)
    expect(opacity.get()).toBe(1)
    expect(onDragStart).not.toHaveBeenCalled()
    expect(onDragEnd).not.toHaveBeenCalled()
  })
})
