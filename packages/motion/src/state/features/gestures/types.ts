import type { Options } from '@/state/types'

export interface StateHandlers {
  enable: VoidFunction
  disable: VoidFunction
}

export interface Gesture {
  isActive: (options: Options) => void
  subscribe: (
    element: Element,
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

export interface DragHandlers {
  onDragStart?: (event: PointerEvent) => void
  onDrag?: (event: PointerEvent) => void
  onDragEnd?: (event: PointerEvent) => void
}
