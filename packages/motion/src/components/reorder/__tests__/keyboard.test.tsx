import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Reorder } from '@/index'
import { ContextCapture, cleanup, focused, press, registerGridLayouts, registerLayouts, renderGroup } from './keyboard-helpers'

describe('reorder keyboard focus', () => {
  afterEach(cleanup)

  it('puts one item in the tab order, the first until one is focused', async () => {
    const { container, getByTestId } = await renderGroup()
    const tabIndexes = () =>
      Array.from(container.querySelectorAll('li')).map(li => (li as HTMLElement).tabIndex)
    expect(tabIndexes()).toEqual([0, -1, -1])

    ;(getByTestId('c') as HTMLElement).focus()
    await nextTick()
    expect(tabIndexes()).toEqual([-1, -1, 0])

    // Focus inside an item makes it the one in the tab order
    ;(getByTestId('b-input') as HTMLElement).focus()
    await nextTick()
    expect(tabIndexes()).toEqual([-1, 0, -1])
  })

  it('lets items override tabIndex', async () => {
    const { getByTestId } = await renderGroup({ initial: ['a'], itemProps: { tabindex: -1 } })
    expect(getByTestId('a').tabIndex).toBe(-1)
  })

  it('makes the first rendered item the tab stop', async () => {
    const values = ref(['a', 'b', 'c'])
    const { getByTestId } = render(defineComponent({
      setup() {
        return () => h(Reorder.Group as any, {
          'values': values.value,
          'onUpdate:values': () => {},
        }, () => [
          h(Reorder.Item as any, { 'key': 'b', 'value': 'b', 'data-testid': 'b' }),
          h(Reorder.Item as any, { 'key': 'c', 'value': 'c', 'data-testid': 'c' }),
          h(Reorder.Item as any, { 'key': 'new', 'value': 'new', 'data-testid': 'new' }),
        ])
      },
    }))
    // "a" isn't rendered (e.g. virtualized), and "new" isn't in values
    await nextTick()
    expect(getByTestId('b').tabIndex).toBe(0)
    expect(getByTestId('c').tabIndex).toBe(-1)
    expect(getByTestId('new').tabIndex).toBe(0)

    // The focused item stays the tab stop until it's unrendered
    ;(getByTestId('c') as HTMLElement).focus()
    await nextTick()
    values.value = ['a', 'b', 'c', 'new']
    await nextTick()
    expect(getByTestId('b').tabIndex).toBe(-1)
    expect(getByTestId('c').tabIndex).toBe(0)
    expect(getByTestId('new').tabIndex).toBe(-1)
  })

  it('moves the tab stop on when its item is unrendered below the group', async () => {
    const shown = ref(['a', 'b', 'c'])
    const { getByTestId } = render(defineComponent({
      setup() {
        return () => h(Reorder.Group as any, {
          'values': ['a', 'b', 'c'],
          'onUpdate:values': () => {},
        }, () => shown.value.map(value => h(Reorder.Item as any, {
          'key': value,
          'value': value,
          'data-testid': value,
        })))
      },
    }))
    await nextTick()
    expect(getByTestId('a').tabIndex).toBe(0)

    shown.value = ['b', 'c']
    await nextTick()
    expect(getByTestId('b').tabIndex).toBe(0)
  })

  it('keeps the tab stop when an item outside values is focused', async () => {
    const { getByTestId } = render(defineComponent({
      setup() {
        return () => h(Reorder.Group as any, {
          'values': ['a', 'b'],
          'onUpdate:values': () => {},
        }, () => [
          h(Reorder.Item as any, { 'key': 'a', 'value': 'a', 'data-testid': 'a' }),
          h(Reorder.Item as any, { 'key': 'b', 'value': 'b', 'data-testid': 'b' }),
          h(Reorder.Item as any, { 'key': 'new', 'value': 'new', 'data-testid': 'new' }),
        ])
      },
    }))
    await nextTick()
    ;(getByTestId('b') as HTMLElement).focus()
    await nextTick()
    ;(getByTestId('new') as HTMLElement).focus()
    await nextTick()
    expect(getByTestId('a').tabIndex).toBe(-1)
    expect(getByTestId('b').tabIndex).toBe(0)
  })

  it('moves focus past values that are not rendered', async () => {
    const shown = ref(['a', 'b', 'c'])
    const { container, getByTestId } = render(defineComponent({
      setup() {
        return () => h(Reorder.Group as any, {
          'values': ['a', 'b', 'c'],
          'onUpdate:values': () => {},
        }, () => [
          h(ContextCapture),
          ...shown.value.map(value => h(Reorder.Item as any, {
            'key': value,
            'value': value,
            'data-testid': value,
          })),
        ])
      },
    }))
    await nextTick()
    registerLayouts(container)
    // b has been measured, then unrendered
    shown.value = ['a', 'c']
    await nextTick()
    ;(getByTestId('a') as HTMLElement).focus()
    await press(getByTestId('a'), 'ArrowDown')
    expect(focused()).toBe('c')
  })

  it('moves focus with arrows until an item is grabbed', async () => {
    const { getByTestId, onUpdateValues } = await renderGroup()
    const a = getByTestId('a') as HTMLElement
    a.focus()
    await nextTick()

    expect(await press(a, 'ArrowDown')).toBe(false)
    expect(focused()).toBe('b')
    expect(getByTestId('b').tabIndex).toBe(0)
    expect(getByTestId('a').tabIndex).toBe(-1)

    await press(getByTestId('b'), 'ArrowDown')
    expect(focused()).toBe('c')
    // Nothing past the end, and arrows across the axis are the browser's
    expect(await press(getByTestId('c'), 'ArrowDown')).toBe(false)
    expect(focused()).toBe('c')
    expect(await press(getByTestId('c'), 'ArrowLeft')).toBe(true)

    await press(getByTestId('c'), 'ArrowUp')
    expect(focused()).toBe('b')
    expect(onUpdateValues).not.toHaveBeenCalled()
  })

  it('leaves Escape to the browser when nothing is grabbed', async () => {
    const { getByTestId } = await renderGroup()
    expect(await press(getByTestId('a'), 'Escape')).toBe(true)
  })

  it('moves focus by row in a grid', async () => {
    const { container, getByTestId } = await renderGroup({
      axis: 'xy',
      initial: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    })
    // a b c
    // d e f
    // g h
    registerGridLayouts(container)
    const e = getByTestId('e') as HTMLElement
    e.focus()
    await nextTick()

    registerGridLayouts(container)
    expect(await press(e, 'ArrowUp')).toBe(false)
    expect(focused()).toBe('b')

    registerGridLayouts(container)
    await press(getByTestId('b'), 'ArrowDown')
    expect(focused()).toBe('e')

    registerGridLayouts(container)
    await press(e, 'ArrowDown')
    expect(focused()).toBe('h')

    // Nothing below the last row
    registerGridLayouts(container)
    expect(await press(getByTestId('h'), 'ArrowDown')).toBe(false)
    expect(focused()).toBe('h')

    // Left and Right still move one place
    registerGridLayouts(container)
    await press(getByTestId('h'), 'ArrowLeft')
    expect(focused()).toBe('g')
  })
})
