import { createContext } from '@/utils'
import type { Box } from 'framer-motion'
import type { Ref } from 'vue'

export interface ReorderContextProps<T> {
  axis?: Ref<'x' | 'y'>
  registerItem?: (item: T, layout: Box) => void
  updateOrder?: (item: T, offset: number, velocity: number) => void

  groupRef?: Ref<HTMLElement | null>
}

export const [useReorderContext, reorderContextProvider] = createContext<ReorderContextProps<any>>('ReorderContext')
