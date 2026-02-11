import type { MotionState } from '@/state/motion-state'
import { createContext } from '@/utils'
import type { NodeGroup } from 'motion-dom'
import type { Ref } from 'vue'

export const [injectMotion, provideMotion] = createContext<MotionState>('Motion')

export interface LayoutGroupState {
  id?: string
  group?: NodeGroup
  forceRender?: VoidFunction
  key?: Ref<number>
}

export const [injectLayoutGroup, provideLayoutGroup] = createContext<LayoutGroupState>('LayoutGroup')
