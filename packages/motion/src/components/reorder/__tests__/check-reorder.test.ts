import type { ItemData } from '../types'
import { describe, expect, it } from 'vitest'
import { checkReorder, detectAxis } from '../utils'

function itemData(
  value: string,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
): ItemData<string> {
  return {
    value,
    layout: {
      x: { min: xMin, max: xMax },
      y: { min: yMin, max: yMax },
    },
  }
}

describe('checkReorder', () => {
  describe('one dimension', () => {
    // a: x[0,100]  b: x[110,120]  c: x[130,230]  (all y[0,100])
    const order = [
      itemData('a', 0, 100, 0, 100),
      itemData('b', 110, 120, 0, 100),
      itemData('c', 130, 230, 0, 100),
    ]
    const values = () => order.map(item => item.value)

    it('returns same array if velocity is 0', () => {
      const newOrder = checkReorder(order, 'a', { x: 116, y: 0 }, { x: 0, y: 0 }, 'x')
      expect(newOrder).toBe(order)
    })

    it('returns same array if value not found', () => {
      const newOrder = checkReorder(order, 'd', { x: 116, y: 0 }, { x: 1, y: 0 }, 'x')
      expect(newOrder).toBe(order)
    })

    it('returns same array if nextItem not found', () => {
      const newOrder = checkReorder(order, 'c', { x: 300, y: 0 }, { x: 1, y: 0 }, 'x')
      expect(newOrder).toBe(order)
    })

    it('returns same array if item has not passed the next item center', () => {
      const newOrder = checkReorder(order, 'a', { x: 14, y: 0 }, { x: 2, y: 0 }, 'x')
      expect(newOrder).toBe(order)
    })

    it('returns reordered array if item has moved right', () => {
      const newOrder = checkReorder(order, 'a', { x: 16, y: 0 }, { x: 1.5, y: 0 }, 'x')
      expect(newOrder).not.toBe(order)
      expect(newOrder.map(item => item.value)).toEqual(['b', 'a', 'c'])
    })

    it('returns reordered array if item has moved down', () => {
      const newOrder = checkReorder(order, 'a', { x: 0, y: 15 }, { x: 0, y: 1 }, 'y')
      expect(newOrder.map(item => item.value)).toEqual(['b', 'a', 'c'])
    })

    it('returns reordered array if item has moved left', () => {
      const newOrder = checkReorder(order, 'b', { x: -61, y: 0 }, { x: -2, y: 0 }, 'x')
      expect(newOrder.map(item => item.value)).toEqual(['b', 'a', 'c'])
    })

    it('returns reordered array if item has moved up', () => {
      const newOrder = checkReorder(order, 'b', { x: 0, y: -61 }, { x: 0, y: -1 }, 'y')
      expect(newOrder.map(item => item.value)).toEqual(['b', 'a', 'c'])
    })

    it('does not mutate the input order', () => {
      checkReorder(order, 'a', { x: 16, y: 0 }, { x: 1.5, y: 0 }, 'x')
      expect(values()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('two dimensions', () => {
    // line 1 (y[0,100]):  a: x[0,100]   b: x[110,120]  c: x[130,230]
    // line 2 (y[110,120]): d: x[0,100]  e: x[110,120]
    const order = [
      itemData('a', 0, 100, 0, 100),
      itemData('b', 110, 120, 0, 100),
      itemData('c', 130, 230, 0, 100),
      itemData('d', 0, 100, 110, 120),
      itemData('e', 110, 120, 110, 120),
    ]
    const valuesOf = (items: ItemData<string>[]) => items.map(item => item.value)

    it('returns reordered array if item has moved left within its line', () => {
      const newOrder = checkReorder(order, 'e', { x: -61, y: 0 }, { x: -1, y: 0 }, 'xy')
      expect(valuesOf(newOrder)).toEqual(['a', 'b', 'c', 'e', 'd'])
    })

    it('returns reordered array if item has moved right within its line', () => {
      const newOrder = checkReorder(order, 'a', { x: 63, y: 0 }, { x: 1, y: 0 }, 'xy')
      expect(valuesOf(newOrder)).toEqual(['b', 'a', 'c', 'd', 'e'])
    })

    it('returns same array if first item of a line is moved left', () => {
      const newOrder = checkReorder(order, 'a', { x: -1, y: 0 }, { x: 1, y: 0 }, 'xy')
      expect(newOrder).toBe(order)
    })

    it('returns same array if last item of a line is moved right', () => {
      const newOrder = checkReorder(order, 'c', { x: 1, y: 0 }, { x: 5, y: 0 }, 'xy')
      expect(newOrder).toBe(order)
    })

    it('returns reordered array if item has moved up to the previous line', () => {
      const newOrder = checkReorder(order, 'e', { x: 0, y: -61 }, { x: 0, y: -1 }, 'xy')
      expect(valuesOf(newOrder)).toEqual(['a', 'b', 'e', 'c', 'd'])
    })

    it('returns reordered array if item has moved down to the next line', () => {
      const newOrder = checkReorder(order, 'a', { x: 0, y: 62 }, { x: 0, y: 1 }, 'xy')
      expect(valuesOf(newOrder)).toEqual(['b', 'c', 'd', 'a', 'e'])
    })

    it('returns same array if item is moved up from the first line', () => {
      const newOrder = checkReorder(order, 'a', { x: 0, y: -61 }, { x: 0, y: -1 }, 'xy')
      expect(newOrder).toBe(order)
    })

    it('returns same array if item is moved down from the last line', () => {
      const newOrder = checkReorder(order, 'e', { x: 0, y: 62 }, { x: 0, y: 1 }, 'xy')
      expect(newOrder).toBe(order)
    })

    it('inserts after the hovered item when direction is rtl', () => {
      const ltrOrder = checkReorder(order, 'a', { x: 0, y: 62 }, { x: 0, y: 1 }, 'xy', 'ltr')
      const rtlOrder = checkReorder(order, 'a', { x: 0, y: 62 }, { x: 0, y: 1 }, 'xy', 'rtl')
      expect(valuesOf(ltrOrder)).toEqual(['b', 'c', 'd', 'a', 'e'])
      expect(valuesOf(rtlOrder)).toEqual(['b', 'c', 'd', 'e', 'a'])
    })
  })
})

describe('detectAxis', () => {
  it('detects axis of horizontally-arranged items', () => {
    expect(detectAxis([
      { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
      { x: { min: 100, max: 200 }, y: { min: 0, max: 100 } },
    ])).toBe('x')

    expect(detectAxis([
      { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
      { x: { min: 101, max: 200 }, y: { min: 40, max: 60 } },
    ])).toBe('x')
  })

  it('detects axis of vertically-arranged items', () => {
    expect(detectAxis([
      { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
      { x: { min: 0, max: 200 }, y: { min: 100, max: 200 } },
    ])).toBe('y')

    expect(detectAxis([
      { x: { min: 40, max: 60 }, y: { min: 0, max: 100 } },
      { x: { min: 0, max: 100 }, y: { min: 100, max: 200 } },
    ])).toBe('y')
  })

  it('detects xy for grid-arranged items', () => {
    expect(detectAxis([
      { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
      { x: { min: 200, max: 300 }, y: { min: 0, max: 100 } },
      { x: { min: 0, max: 100 }, y: { min: 200, max: 300 } },
    ])).toBe('xy')

    // Diagonally-arranged items are separated on both axes
    expect(detectAxis([
      { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
      { x: { min: 200, max: 300 }, y: { min: 200, max: 300 } },
    ])).toBe('xy')
  })

  it('defaults to y for single or no measured items', () => {
    expect(detectAxis([
      { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
    ])).toBe('y')

    expect(detectAxis([])).toBe('y')
  })
})
