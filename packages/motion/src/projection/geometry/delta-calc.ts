import type { Axis } from 'framer-motion'

export function calcLength(axis: Axis) {
  return axis.max - axis.min
}
