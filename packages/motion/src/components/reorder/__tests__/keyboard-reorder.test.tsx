import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { motionValue } from 'motion-dom'
import { Reorder } from '@/index'
import { nextFrames } from '@/features/gestures/__tests__/utils'
import { ContextCapture, cleanup, focused, isGrabbed, order, press, registerGridLayouts, registerLayouts, renderGroup } from './keyboard-helpers'

describe('reorder keyboard reordering', () => {
  afterEach(cleanup)

  it('grabs with Space, moves with arrows, and drops with Space', async () => {
    const { container, getByTestId, onUpdateValues } = await renderGroup()
    const a = getByTestId('a') as HTMLElement

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
    expect(order(container)).toEqual(['b', 'a', 'c'])

    // Dropped: arrows move focus again
    a.focus()
    await nextTick()
    await press(a, 'ArrowDown')
    expect(focused()).toBe('c')
    expect(order(container)).toEqual(['b', 'a', 'c'])
    expect(onUpdateValues).toHaveBeenCalledTimes(3)
  })

  it('leaves Enter alone so it keeps its tap meaning', async () => {
    const { getByTestId, onUpdateValues } = await renderGroup()
    const b = getByTestId('b')

    expect(await press(b, 'Enter')).toBe(true)
    expect(isGrabbed(b)).toBe(false)
    await press(b, 'ArrowUp')
    expect(onUpdateValues).not.toHaveBeenCalled()
  })

  it('ignores a held Space', async () => {
    const { getByTestId } = await renderGroup()
    const a = getByTestId('a')

    await press(a, ' ')
    expect(await press(a, ' ', { repeat: true })).toBe(false)
    expect(isGrabbed(a)).toBe(true)
  })

  it('cancels with Escape, restoring the order from the grab', async () => {
    const { container, getByTestId, onUpdateValues } = await renderGroup()
    const a = getByTestId('a')

    await press(a, ' ')
    await press(a, 'ArrowDown')
    await press(a, 'ArrowDown')
    expect(order(container)).toEqual(['b', 'c', 'a'])

    expect(await press(a, 'Escape')).toBe(false)
    expect(onUpdateValues).toHaveBeenLastCalledWith(['a', 'b', 'c'], 'a')
    expect(order(container)).toEqual(['a', 'b', 'c'])
    expect(isGrabbed(a)).toBe(false)

    // Dropped, so the arrow moves focus, not the item
    await press(a, 'ArrowDown')
    expect(order(container)).toEqual(['a', 'b', 'c'])
  })

  it('restores the order from the latest grab', async () => {
    const { container, getByTestId, onUpdateValues } = await renderGroup()
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

  it('cancelling without a move does not reorder', async () => {
    const { getByTestId, onUpdateValues } = await renderGroup()
    const a = getByTestId('a')

    await press(a, ' ')
    expect(await press(a, 'Escape')).toBe(false)
    expect(isGrabbed(a)).toBe(false)
    expect(onUpdateValues).not.toHaveBeenCalled()
  })

  it('drops on blur and keeps focus through keyed reorders', async () => {
    const { container, getByTestId, onUpdateValues } = await renderGroup()
    const a = getByTestId('a') as HTMLElement
    a.focus()
    await nextTick()
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
    await nextTick()
    // Dropped, so the arrow moves focus, not the item
    expect(await press(a, 'ArrowDown')).toBe(false)
    expect(focused()).toBe('c')
    expect(order(container)).toEqual(['b', 'a', 'c'])
    expect(onUpdateValues).toHaveBeenCalledTimes(1)
  })

  it('ignores arrows across the axis and other keys while grabbed', async () => {
    const { getByTestId, onUpdateValues } = await renderGroup()
    const b = getByTestId('b')

    await press(b, ' ')
    for (const key of ['ArrowLeft', 'ArrowRight', 'Tab', 'a'])
      expect(await press(b, key)).toBe(true)
    expect(onUpdateValues).not.toHaveBeenCalled()
    expect(isGrabbed(b)).toBe(true)
  })

  it('ignores keys with Alt, Ctrl or Meta held', async () => {
    const { getByTestId, onUpdateValues } = await renderGroup()
    const a = getByTestId('a')

    for (const modifier of ['altKey', 'ctrlKey', 'metaKey'])
      expect(await press(a, ' ', { [modifier]: true })).toBe(true)
    expect(isGrabbed(a)).toBe(false)

    await press(a, ' ')
    for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
      expect(await press(a, 'ArrowDown', { [modifier]: true })).toBe(true)
      expect(await press(a, 'Escape', { [modifier]: true })).toBe(true)
    }
    expect(onUpdateValues).not.toHaveBeenCalled()
    expect(isGrabbed(a)).toBe(true)

    await press(a, 'ArrowDown')
    expect(onUpdateValues).toHaveBeenCalledWith(['b', 'a', 'c'], 'a')
  })

  it('does nothing past either end', async () => {
    const { getByTestId, onUpdateValues } = await renderGroup()

    await press(getByTestId('a'), ' ')
    expect(await press(getByTestId('a'), 'ArrowUp')).toBe(false)
    await press(getByTestId('c'), ' ')
    expect(await press(getByTestId('c'), 'ArrowDown')).toBe(false)
    expect(onUpdateValues).not.toHaveBeenCalled()
  })

  it('moves with left and right on the x axis', async () => {
    const { container, getByTestId } = await renderGroup({ axis: 'x' })
    const a = getByTestId('a')

    await press(a, ' ')
    await press(a, 'ArrowRight')
    expect(order(container)).toEqual(['b', 'a', 'c'])

    expect(await press(a, 'ArrowDown')).toBe(true)
    expect(order(container)).toEqual(['b', 'a', 'c'])

    await press(a, 'ArrowLeft')
    expect(order(container)).toEqual(['a', 'b', 'c'])
  })

  it('flips left and right in RTL', async () => {
    const { container, getByTestId } = await renderGroup({ axis: 'x', dir: 'rtl' })

    await press(getByTestId('a'), ' ')
    await press(getByTestId('a'), 'ArrowLeft')
    expect(order(container)).toEqual(['b', 'a', 'c'])
  })

  it('accepts every arrow on the xy axis', async () => {
    const { container, getByTestId } = await renderGroup({ axis: 'xy' })
    const a = getByTestId('a')

    await press(a, ' ')
    await press(a, 'ArrowRight')
    expect(order(container)).toEqual(['b', 'a', 'c'])
    await press(a, 'ArrowDown')
    expect(order(container)).toEqual(['b', 'c', 'a'])
    await press(a, 'ArrowUp')
    expect(order(container)).toEqual(['b', 'a', 'c'])
    await press(a, 'ArrowLeft')
    expect(order(container)).toEqual(['a', 'b', 'c'])
  })

  it('moves up and down by row in a grid', async () => {
    const { container, getByTestId } = await renderGroup({
      axis: 'xy',
      initial: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    })
    registerGridLayouts(container)
    const e = getByTestId('e') as HTMLElement
    await press(e, ' ')

    /**
     * a b c
     * d e f
     * g h
     */
    const steps: [string, string][] = [
      // Up takes b's slot above, not d's beside
      ['ArrowUp', 'aebcdfgh'],
      // Nothing above the first row
      ['ArrowUp', 'aebcdfgh'],
      ['ArrowDown', 'abcdefgh'],
      // Into the short last row, by the column it's nearest
      ['ArrowDown', 'abcdfghe'],
      // Nothing below the last row
      ['ArrowDown', 'abcdfghe'],
      // Left and Right still move one place
      ['ArrowLeft', 'abcdfgeh'],
      ['ArrowUp', 'abcedfgh'],
    ]

    for (const [key, expected] of steps) {
      await nextTick()
      registerGridLayouts(container)
      await press(e, key)
      expect(order(container).join('')).toBe(expected)
    }
  })

  it('ignores keys from inside the item', async () => {
    const { getByTestId, onUpdateValues } = await renderGroup()
    const input = getByTestId('a-input')

    expect(await press(input, ' ')).toBe(true)
    expect(await press(input, 'Enter')).toBe(true)
    expect(isGrabbed(getByTestId('a'))).toBe(false)

    await press(getByTestId('a'), ' ')
    expect(await press(input, 'ArrowDown')).toBe(true)
    expect(await press(input, 'Escape')).toBe(true)
    expect(onUpdateValues).not.toHaveBeenCalled()
    expect(isGrabbed(getByTestId('a'))).toBe(true)
  })

  it('lets the item onKeyDown prevent grabbing and moving', async () => {
    let prevent = true
    const onKeyDown = vi.fn((event: KeyboardEvent) => {
      if (prevent)
        event.preventDefault()
    })
    const { getByTestId, onUpdateValues } = await renderGroup({ itemProps: { onKeyDown } })
    const a = getByTestId('a')

    await press(a, ' ')
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(isGrabbed(a)).toBe(false)

    prevent = false
    await press(a, ' ')
    expect(isGrabbed(a)).toBe(true)

    prevent = true
    expect(await press(a, 'ArrowDown')).toBe(false)
    expect(await press(a, 'Escape')).toBe(false)
    expect(onUpdateValues).not.toHaveBeenCalled()
    expect(isGrabbed(a)).toBe(true)
  })

  it('keeps focus and the grab on the moved item', async () => {
    const { getByTestId } = await renderGroup()
    const b = getByTestId('b') as HTMLElement

    b.focus()
    await nextTick()
    await press(b, ' ')
    await press(b, 'ArrowUp')
    expect(document.activeElement).toBe(b)
    expect(isGrabbed(b)).toBe(true)

    await press(b, 'ArrowDown')
    await press(b, 'ArrowDown')
    expect(document.activeElement).toBe(b)
    expect(isGrabbed(b)).toBe(true)
  })

  it('skips and keeps unrendered values in place', async () => {
    const onUpdateValues = vi.fn()
    const values = ref(['a', 'hidden', 'b'])
    const { container, getByTestId } = render(defineComponent({
      setup() {
        return () => h(Reorder.Group as any, {
          'values': values.value,
          'onUpdate:values': (newOrder: string[], moved: string) => {
            onUpdateValues(newOrder, moved)
            values.value = newOrder
          },
        }, () => [
          h(ContextCapture),
          h(Reorder.Item as any, { 'key': 'a', 'value': 'a', 'data-testid': 'a' }),
          h(Reorder.Item as any, { 'key': 'b', 'value': 'b', 'data-testid': 'b' }),
        ])
      },
    }))
    await nextTick()
    registerLayouts(container)

    await press(getByTestId('a'), ' ')
    await press(getByTestId('a'), 'ArrowDown')
    // As with drag, "a" and "b" swap slots and "hidden" keeps its own
    expect(onUpdateValues).toHaveBeenLastCalledWith(['b', 'hidden', 'a'], 'a')

    // The app has since moved "hidden" too: cancelling only restores
    // the rendered items, into the slots they now hold
    values.value = ['hidden', 'b', 'a']
    await nextTick()
    registerLayouts(container)
    await press(getByTestId('a'), 'Escape')
    expect(onUpdateValues).toHaveBeenLastCalledWith(['hidden', 'a', 'b'], 'a')
  })

  it('cancelling keeps values added since the grab in their slots', async () => {
    const onUpdateValues = vi.fn()
    const values = ref(['a', 'b', 'c'])
    const { container, getByTestId } = render(defineComponent({
      setup() {
        return () => h(Reorder.Group as any, {
          'values': values.value,
          'onUpdate:values': (newOrder: string[], moved: string) => {
            onUpdateValues(newOrder, moved)
            values.value = newOrder
          },
        }, () => [
          h(ContextCapture),
          ...values.value.map(value => h(Reorder.Item as any, {
            'key': value,
            'value': value,
            'data-testid': value,
          })),
        ])
      },
    }))
    await nextTick()
    registerLayouts(container)

    await press(getByTestId('b'), ' ')
    values.value = ['new', 'a', 'b', 'c', 'end']
    await nextTick()
    registerLayouts(container)
    await press(getByTestId('b'), 'ArrowDown')
    expect(onUpdateValues).toHaveBeenLastCalledWith(['new', 'a', 'c', 'b', 'end'], 'b')

    values.value = ['new', 'a', 'c', 'b', 'end']
    await nextTick()
    registerLayouts(container)
    await press(getByTestId('b'), 'Escape')
    expect(onUpdateValues).toHaveBeenLastCalledWith(['new', 'a', 'b', 'c', 'end'], 'b')
  })

  it('commits measured values to their current slots', async () => {
    const { getByTestId, onUpdateValues } = await renderGroup({ initial: ['a', 'hidden', 'b'], unrendered: ['hidden'] })
    const a = getByTestId('a')

    await press(a, ' ')
    await press(a, 'ArrowDown')
    expect(onUpdateValues).toHaveBeenLastCalledWith(['b', 'hidden', 'a'], 'a')
  })

  it('activates whileDrag without firing pointer drag callbacks', async () => {
    const onDragStart = vi.fn()
    const onDragEnd = vi.fn()
    const opacity = motionValue(1)
    const { getByTestId } = await renderGroup({
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
