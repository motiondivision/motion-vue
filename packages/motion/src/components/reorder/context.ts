import { createContext } from '@/utils'
import type { Box } from 'framer-motion'
import type { Point } from 'motion-utils'
import type { Ref } from 'vue'
import type { ReorderAxis } from './types'

export interface ReorderContextProps<T> {
  axis?: Ref<ReorderAxis>
  registerItem?: (item: T, layout: Box) => void
  updateOrder?: (item: T, offset: Point, velocity: Point) => void

  groupRef?: Ref<HTMLElement | null>
}

export const [useReorderContext, reorderContextProvider] = createContext<ReorderContextProps<any>>('ReorderContext')
