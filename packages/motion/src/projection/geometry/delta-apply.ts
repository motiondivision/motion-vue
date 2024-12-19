import type { Axis } from 'framer-motion'

export function translateAxis(axis: Axis, distance: number) {
  axis.min = axis.min + distance
  axis.max = axis.max + distance
}
