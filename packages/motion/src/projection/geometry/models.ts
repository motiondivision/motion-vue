import type { Axis, Box } from 'framer-motion'

export const createAxis = (): Axis => ({ min: 0, max: 0 })

export function createBox(): Box {
  return {
    x: createAxis(),
    y: createAxis(),
  }
}
