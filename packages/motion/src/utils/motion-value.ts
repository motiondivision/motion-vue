import type { MotionValue } from 'framer-motion/dom'

export function isMotionValue(value: any): value is MotionValue {
  return Boolean(value && value.getVelocity)
}
