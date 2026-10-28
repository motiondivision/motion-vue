import { createContext } from '@/utils'
import type { Box, Point } from 'motion-utils'
import type { Ref } from 'vue'
import type { ReorderAxis } from './types'

export interface ReorderContextProps<T> {
  axis?: Ref<ReorderAxis>
  registerItem?: (item: T, layout: Box) => void
  updateOrder?: (item: T, offset: Point, velocity: Point) => void
  onKeyDown?: (
    event: KeyboardEvent,
    item: T,
    orderBeforeGrab: T[] | undefined,
    setKeyboardGrab: (element: Element, orderBeforeGrab?: T[]) => void,
  ) => void

  /**
   * Whether a reorder happened during the current press. The release that
   * ends a reordering drag fires a click that isn't a real click (#2682).
   */
  hasReordered?: Ref<boolean>

  groupRef?: Ref<HTMLElement | null>
}

export const [useReorderContext, reorderContextProvider] = createContext<ReorderContextProps<any>>('ReorderContext')
