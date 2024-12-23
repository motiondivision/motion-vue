import type { Options } from '@/types'

export interface StateHandlers {
  enable: VoidFunction
  disable: VoidFunction
}

export interface Gesture {
  isActive: (options: Options) => void
  subscribe: (
    element: HTMLElement,
    stateHandlers: StateHandlers,
    options: Options
  ) => () => void
}

export interface DragOptions {
  constraints?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  dragSnapToOrigin?: boolean
  dragElastic?: number
  dragMomentum?: boolean
  dragTransition?: {
    power?: number
    timeConstant?: number
  }
}
