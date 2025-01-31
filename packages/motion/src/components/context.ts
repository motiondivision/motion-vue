import type { MotionState } from '@/state/motion-state'
import { createContext } from '@/utils'
import type { IProjectionNode } from 'framer-motion'
import type { Ref } from 'vue'

export const [injectMotion, provideMotion] = createContext<MotionState>('Motion')

export interface NodeGroup {
  add: (node: IProjectionNode) => void
  remove: (node: IProjectionNode) => void
  dirty: VoidFunction
}
export interface LayoutGroupState {
  id?: string
  group?: NodeGroup
  forceRender?: VoidFunction
  key?: Ref<number>
}

export const [injectLayoutGroup, provideLayoutGroup] = createContext<LayoutGroupState>('LayoutGroup')
