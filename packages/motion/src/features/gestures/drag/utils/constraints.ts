import type { ResolvedConstraints } from '@/features/gestures/drag/types'
import { calcLength } from '@/projection/geometry/delta-calc'
import { progress as calcProgress, clamp, mixNumber } from 'framer-motion/dom'
import type { Axis, BoundingBox, Box, DragElastic } from 'framer-motion'

/**
 * Apply constraints to a point. These constraints are both physical along an
 * axis, and an elastic factor that determines how much to constrain the point
 * by if it does lie outside the defined parameters.
 */
export function applyConstraints(
  point: number,
  { min, max }: Partial<Axis>,
  elastic?: Axis,
): number {
  if (min !== undefined && point < min) {
    // If we have a min point defined, and this is outside of that, constrain
    point = elastic
      ? mixNumber(min, point, elastic.min)
      : Math.max(point, min)
  }
  else if (max !== undefined && point > max) {
    // If we have a max point defined, and this is outside of that, constrain
    point = elastic
      ? mixNumber(max, point, elastic.max)
      : Math.min(point, max)
  }

  return point
}

export const defaultElastic = 0.35

/**
 * Calculate constraints in terms of the viewport when
 * defined relatively to the measured bounding box.
 */
export function calcRelativeConstraints(
  layoutBox: Box,
  { top, left, bottom, right }: Partial<BoundingBox>,
): ResolvedConstraints {
  return {
    x: calcRelativeAxisConstraints(layoutBox.x, left, right),
    y: calcRelativeAxisConstraints(layoutBox.y, top, bottom),
  }
}

/**
 * Calculate constraints in terms of the viewport when defined relatively to the
 * measured axis. This is measured from the nearest edge, so a max constraint of 200
 * on an axis with a max value of 300 would return a constraint of 500 - axis length
 */
export function calcRelativeAxisConstraints(
  axis: Axis,
  min?: number,
  max?: number,
): Partial<Axis> {
  return {
    min: min !== undefined ? axis.min + min : undefined,
    max:
          max !== undefined
            ? axis.max + max - (axis.max - axis.min)
            : undefined,
  }
}

/**
 * Accepts a dragElastic prop and returns resolved elastic values for each axis.
 */
export function resolveDragElastic(
  dragElastic: DragElastic = defaultElastic,
): Box {
  if (dragElastic === false) {
    dragElastic = 0
  }
  else if (dragElastic === true) {
    dragElastic = defaultElastic
  }

  return {
    x: resolveAxisElastic(dragElastic, 'left', 'right'),
    y: resolveAxisElastic(dragElastic, 'top', 'bottom'),
  }
}

export function resolveAxisElastic(
  dragElastic: DragElastic,
  minLabel: string,
  maxLabel: string,
): Axis {
  return {
    min: resolvePointElastic(dragElastic, minLabel),
    max: resolvePointElastic(dragElastic, maxLabel),
  }
}

export function resolvePointElastic(
  dragElastic: DragElastic,
  label: string,
): number {
  return typeof dragElastic === 'number'
    ? dragElastic
    : dragElastic[label as keyof typeof dragElastic] || 0
}

/**
 * Rebase the calculated viewport constraints relative to the layout.min point.
 */
export function rebaseAxisConstraints(
  layout: Axis,
  constraints: Partial<Axis>,
): Partial<Axis> {
  const relativeConstraints: Partial<Axis> = {}

  if (constraints.min !== undefined) {
    relativeConstraints.min = constraints.min - layout.min
  }

  if (constraints.max !== undefined) {
    relativeConstraints.max = constraints.max - layout.min
  }

  return relativeConstraints
}

/**
 * Calculate viewport constraints when defined as another viewport-relative box
 */
export function calcViewportConstraints(layoutBox: Box, constraintsBox: Box) {
  return {
    x: calcViewportAxisConstraints(layoutBox.x, constraintsBox.x),
    y: calcViewportAxisConstraints(layoutBox.y, constraintsBox.y),
  }
}

/**
 * Calculate viewport constraints when defined as another viewport-relative axis
 */
export function calcViewportAxisConstraints(
  layoutAxis: Axis,
  constraintsAxis: Axis,
) {
  let min = constraintsAxis.min - layoutAxis.min
  let max = constraintsAxis.max - layoutAxis.max

  // If the constraints axis is actually smaller than the layout axis then we can
  // flip the constraints
  if (
    constraintsAxis.max - constraintsAxis.min
    < layoutAxis.max - layoutAxis.min
  ) {
    ;[min, max] = [max, min]
  }

  return { min, max }
}

/**
 * Calculate a transform origin relative to the source axis, between 0-1, that results
 * in an asthetically pleasing scale/transform needed to project from source to target.
 */
export function calcOrigin(source: Axis, target: Axis): number {
  let origin = 0.5
  const sourceLength = calcLength(source)
  const targetLength = calcLength(target)

  if (targetLength > sourceLength) {
    origin = calcProgress(target.min, target.max - sourceLength, source.min)
  }
  else if (sourceLength > targetLength) {
    origin = calcProgress(source.min, source.max - targetLength, target.min)
  }

  return clamp(0, 1, origin)
}
