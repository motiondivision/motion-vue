import type { EasingFunction, ResolvedValues } from 'framer-motion'

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

export interface ScrollOptions {
  source?: HTMLElement
  container?: HTMLElement
  target?: Element
  axis?: 'x' | 'y'
  offset?: ScrollOffset
}

export type OnScrollProgress = (progress: number) => void
export type OnScrollWithInfo = (progress: number, info: ScrollInfo) => void

export type OnScroll = OnScrollProgress | OnScrollWithInfo

export interface AxisScrollInfo {
  current: number
  offset: number[]
  progress: number
  scrollLength: number
  velocity: number

  // TODO Rename before documenting
  targetOffset: number

  targetLength: number
  containerLength: number
  interpolatorOffsets?: number[]
  interpolate?: EasingFunction
}

export interface ScrollInfo {
  time: number
  x: AxisScrollInfo
  y: AxisScrollInfo
}

export type OnScrollInfo = (info: ScrollInfo) => void

export type OnScrollHandler = {
  measure: () => void
  update: (time: number) => void
  notify: () => void
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

export interface TransformOrigin {
  originX?: number | string
  originY?: number | string
  originZ?: number | string
}

export interface HTMLRenderState {
  /**
   * A mutable record of transforms we want to apply directly to the rendered Element
   * every frame. We use a mutable data structure to reduce GC during animations.
   */
  transform: ResolvedValues

  /**
   * A mutable record of transform origins we want to apply directly to the rendered Element
   * every frame. We use a mutable data structure to reduce GC during animations.
   */
  transformOrigin: TransformOrigin

  /**
   * A mutable record of styles we want to apply directly to the rendered Element
   * every frame. We use a mutable data structure to reduce GC during animations.
   */
  style: ResolvedValues

  /**
   * A mutable record of CSS variables we want to apply directly to the rendered Element
   * every frame. We use a mutable data structure to reduce GC during animations.
   */
  vars: ResolvedValues
}

export type SVGDimensions = {
  x: number
  y: number
  width: number
  height: number
}

export interface SVGRenderState extends HTMLRenderState {
  /**
   * Measured dimensions of the SVG element to be used to calculate a transform-origin.
   */
  dimensions?: SVGDimensions

  /**
   * A mutable record of attributes we want to apply directly to the rendered Element
   * every frame. We use a mutable data structure to reduce GC during animations.
   */
  attrs: ResolvedValues
}
