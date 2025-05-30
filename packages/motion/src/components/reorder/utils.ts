import type { ItemData } from '@/components/reorder/types'
import { isMotionValue, mixNumber, motionValue } from 'framer-motion/dom'

export function compareMin<V>(a: ItemData<V>, b: ItemData<V>) {
  return a.layout.min - b.layout.min
}

export function getValue<V>(item: ItemData<V>) {
  return item.value
}

export function checkReorder<T>(
  order: ItemData<T>[],
  value: T,
  offset: number,
  velocity: number,
): ItemData<T>[] {
  if (!velocity)
    return order

  const index = order.findIndex(item => item.value === value)

  if (index === -1)
    return order

  const nextOffset = velocity > 0 ? 1 : -1
  const nextItem = order[index + nextOffset]

  if (!nextItem)
    return order

  const item = order[index]
  const nextLayout = nextItem.layout
  const nextItemCenter = mixNumber(nextLayout.min, nextLayout.max, 0.5)

  if (
    (nextOffset === 1 && item.layout.max + offset > nextItemCenter)
    || (nextOffset === -1 && item.layout.min + offset < nextItemCenter)
  ) {
    return moveItem(order, index, index + nextOffset)
  }

  return order
}

export function moveItem<T>([...arr]: T[], fromIndex: number, toIndex: number) {
  const startIndex = fromIndex < 0 ? arr.length + fromIndex : fromIndex

  if (startIndex >= 0 && startIndex < arr.length) {
    const endIndex = toIndex < 0 ? arr.length + toIndex : toIndex

    const [item] = arr.splice(fromIndex, 1)
    arr.splice(endIndex, 0, item)
  }

  return arr
}

export function useDefaultMotionValue(value: any, defaultValue: number = 0) {
  return isMotionValue(value) ? value : motionValue(defaultValue)
}
