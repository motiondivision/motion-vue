import type { MotionNodeOptions } from 'motion-dom'

export type SupportedEdgeUnit = 'px' | 'vw' | 'vh' | '%'

export type EdgeUnit = `${number}${SupportedEdgeUnit}`

export type NamedEdges = 'start' | 'end' | 'center'

export type EdgeString = NamedEdges | EdgeUnit | `${number}`

export type Edge = EdgeString | number

export type ProgressIntersection = [number, number]

export type Intersection = `${Edge} ${Edge}`

/**
 * Scroll offset definition for useScroll.
 * Public value export (const presets) lives in value/scroll/offsets.ts.
 */
export type ScrollOffset = Array<Edge | Intersection | ProgressIntersection>

export interface ScrollInfoOptions {
  container?: HTMLElement
  target?: Element
  axis?: 'x' | 'y'
  offset?: ScrollOffset
  /**
   * When true, enables per-frame checking of scrollWidth/scrollHeight
   * to detect content size changes and recalculate scroll progress.
   * @default false
   */
  trackContentSize?: boolean
}

export type $Transition = MotionNodeOptions['transition']
