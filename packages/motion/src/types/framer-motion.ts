export interface FrameData {
  delta: number
  timestamp: number
  isProcessing: boolean
}

export interface MotionValueEventCallbacks<V> {
  animationStart: () => void
  animationComplete: () => void
  animationCancel: () => void
  change: (latestValue: V) => void
  renderRequest: () => void
}

export type SupportedEdgeUnit = 'px' | 'vw' | 'vh' | '%'

export type EdgeUnit = `${number}${SupportedEdgeUnit}`

export type NamedEdges = 'start' | 'end' | 'center'

export type EdgeString = NamedEdges | EdgeUnit | `${number}`

export type Edge = EdgeString | number

export type ProgressIntersection = [number, number]

export type Intersection = `${Edge} ${Edge}`

export type ScrollOffset = Array<Edge | Intersection | ProgressIntersection>

export interface ScrollInfoOptions {
  container?: HTMLElement
  target?: Element
  axis?: 'x' | 'y'
  offset?: ScrollOffset
}
