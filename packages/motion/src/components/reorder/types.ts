import type { Box } from 'motion-utils'

export type ReorderAxis = 'x' | 'y' | 'xy'

export interface ItemData<T> {
  value: T
  layout: Box
}
