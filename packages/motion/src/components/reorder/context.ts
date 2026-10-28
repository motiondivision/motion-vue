import { createContext } from '@/utils'
import type { Box, Point } from 'motion-utils'
import type { Component, Ref } from 'vue'
import type { ReorderAxis } from './types'

/**
 * `motion` and `m` are Proxies: indexing them by a tag returns the real
 * component Vue can render. The group and its items index the same one.
 */
export type MotionNameSpace = Record<string, Component>

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

  /**
   * `Motion` outside LazyMotion, `m` inside it. Items resolve their own tag
   * from it, so a group inside LazyMotion doesn't pull the full feature bundle.
   */
  namespace: MotionNameSpace
}

export const [useReorderContext, reorderContextProvider] = createContext<ReorderContextProps<any>>('ReorderContext')
