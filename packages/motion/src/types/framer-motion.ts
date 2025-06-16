import type { MotionNodeOptions } from 'motion-dom'

export type { Point } from 'framer-motion'

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

export interface Orchestration {
  delay?: number

  when?: false | 'beforeChildren' | 'afterChildren' | string
  delayChildren?: number

  staggerChildren?: number

  staggerDirection?: number
}

export type $Transition = MotionNodeOptions['transition']
