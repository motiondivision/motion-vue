import type { Box } from 'framer-motion'

export type ReorderAxis = 'x' | 'y' | 'xy'

export interface ItemData<T> {
  value: T
  layout: Box
}
