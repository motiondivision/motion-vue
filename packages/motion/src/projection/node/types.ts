import type { Box, Delta, ResolvedValues } from 'framer-motion'

export interface Measurements {
  animationId: number
  measuredBox: Box
  layoutBox: Box
  latestValues: ResolvedValues
  source: number
}
export interface LayoutUpdateData {
  layout: Box
  snapshot: Measurements
  delta: Delta
  layoutDelta: Delta
  hasLayoutChanged: boolean
  hasRelativeTargetChanged: boolean
}
